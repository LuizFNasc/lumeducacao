import { google } from "googleapis";
import { Readable } from "node:stream";

/**
 * Cliente somente leitura para a pasta de origem no Google Drive, autenticado
 * via conta de serviço. Hoje o acervo já está espelhado no repositório
 * (`lumeducacao/`), que é a fonte usada por scripts/sync-to-blob.ts — este
 * módulo fica pronto para quando o Drive precisar ser lido diretamente
 * (ex: novos materiais adicionados só lá).
 *
 * Variáveis de ambiente necessárias:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL
 * - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (com \n escapado)
 * - GOOGLE_DRIVE_FOLDER_ID (pasta raiz, a conta de serviço precisa ter
 *   permissão de leitor compartilhada com ela)
 */

function getCredentials() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY precisam estar configuradas.",
    );
  }

  return { email, privateKey };
}

export function getDriveClient() {
  const { email, privateKey } = getCredentials();

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

export interface DriveFileEntry {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  parents?: string[];
}

// Lista recursivamente todos os arquivos dentro de uma pasta do Drive.
export async function listDriveFilesRecursively(
  folderId: string,
): Promise<DriveFileEntry[]> {
  const drive = getDriveClient();
  const results: DriveFileEntry[] = [];

  async function walk(currentFolderId: string) {
    let pageToken: string | undefined;
    do {
      const response = await drive.files.list({
        q: `'${currentFolderId}' in parents and trashed = false`,
        fields: "nextPageToken, files(id, name, mimeType, size, parents)",
        pageSize: 200,
        pageToken,
      });

      for (const file of response.data.files ?? []) {
        if (!file.id || !file.name || !file.mimeType) continue;

        if (file.mimeType === "application/vnd.google-apps.folder") {
          await walk(file.id);
        } else {
          results.push({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size ?? undefined,
            parents: file.parents ?? undefined,
          });
        }
      }

      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);
  }

  await walk(folderId);
  return results;
}

// Baixa um arquivo do Drive para um Buffer em memória.
export async function downloadDriveFile(fileId: string): Promise<Buffer> {
  const drive = getDriveClient();
  const response = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" },
  );

  const chunks: Buffer[] = [];
  const stream = response.data as Readable;

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
