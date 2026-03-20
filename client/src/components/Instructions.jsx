const steps = [
  'Zaloguj się do LinkedIn i przejdź do swojego profilu klikając na zdjęcie profilowe.',
  'Kliknij przycisk oznaczony trzema kropkami "..." na swoim profilu, a następnie wybierz "Zapisz jako PDF".',
  'LinkedIn wygeneruje plik PDF z Twoim profilem. Zapisz go na swoim komputerze.',
  'Wgraj pobrany plik PDF poniżej i kliknij "Analizuj profil", aby otrzymać sugestie.',
];

export default function Instructions() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-6 h-6 rounded-full bg-linkedin-blue text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
        <h3 className="text-white font-semibold">Wyeksportuj swój profil LinkedIn do PDF</h3>
      </div>

      <ol className="space-y-1.5 ml-9">
        {steps.map((step, i) => (
          <li key={i} className="text-gray-400 text-xs leading-relaxed flex gap-2">
            <span className="text-linkedin-blue font-medium flex-shrink-0">{i + 1}.</span>
            {step}
          </li>
        ))}
      </ol>

      <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-linkedin-blue/5 border border-linkedin-blue/20 ml-9">
        <p className="text-linkedin-blue-light/80 text-xs">
          <strong className="text-linkedin-blue-light">Prywatność:</strong> Twój plik nie jest trwale przechowywany na naszych serwerach.
        </p>
      </div>
    </div>
  );
}
