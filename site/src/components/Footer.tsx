export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-brand-ink/70 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-heading text-base text-brand-ink">
            lum<span className="text-brand-pink">educação</span>
          </p>
          <p>Atividades pedagógicas digitais da Educação Infantil ao 5º ano.</p>
        </div>
        <p className="mt-6 text-xs text-brand-ink/50">
          © {new Date().getFullYear()} Lumeducação. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
