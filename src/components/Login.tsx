import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: { name: string; email: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Por favor, digite seu nome de estudante.');
      return;
    }

    const userName = name.trim() || email.split('@')[0] || 'Estudante da Toca';
    
    if (rememberMe) {
      localStorage.setItem(
        'study_burrow_user',
        JSON.stringify({ name: userName, email: email.trim() })
      );
    }

    onLogin({ name: userName, email: email.trim() });
  };

  const handleGuestLogin = () => {
    const guestUser = { name: 'Estudante Visitante', email: 'visitante@toca.com' };
    localStorage.setItem('study_burrow_user', JSON.stringify(guestUser));
    onLogin(guestUser);
  };

  return (
    <div className="min-h-screen bg-[#fdf9f0] paper-texture flex items-center justify-center p-4 md:p-8 font-body select-none">
      <div className="w-full max-w-4xl bg-[#fdf9f0] border-4 border-[#7d5231] rounded-[2.5rem] shadow-[0_12px_0_0_rgba(125,82,49,1)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
        
        {/* Left Side Decorative Cottage Illustration & Welcome */}
        <div className="md:col-span-5 bg-[#f1eee5] border-b-4 md:border-b-0 md:border-r-4 border-[#7d5231] p-8 flex flex-col justify-between items-center text-center relative overflow-hidden">
          {/* Top Logo / Title */}
          <div className="z-10">
            <span className="bg-[#c6edc4] text-[#012108] text-xs font-bold px-3 py-1 rounded-full border border-[#436444] inline-block mb-3">
              🌱 Toca de Estudos
            </span>
            <h1 className="font-headline text-3xl font-bold text-[#7d5231]">
              Study Burrow
            </h1>
            <p className="font-body text-xs text-[#424841] mt-1">
              Ready to grow?
            </p>
          </div>

          {/* Bunny Mascot Illustration */}
          <div className="my-6 relative z-10">
            <div className="w-44 h-44 rounded-full border-4 border-[#996a47] overflow-hidden bg-white shadow-[0_6px_0_0_rgba(125,82,49,1)] mx-auto relative group">
              <img
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                alt="Coelho leitor no chalé aconchegante"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2vvVTLJEWtHo-ixQTsHvHoAIf4VnUgU8Ccpucdhd5i0Dy1Y_n76htpb7jzitskDwCmV-U0J63O3ZGkZoJrHgzFUN9h_nbFRR5logXC0lKwFeS5NkautJudwm-D6Xa9LqzE1SU8YfbO2cCzgh517h4PC_V4Vuzfo95BRSK53dkGVvz7wEqrQ3ur99yFHnk1E-ElQCACjwnpVfAAEMrlXlnpRRUsbOxTnz1-Th6UqYKwAeKBslEKjnH"
              />
            </div>
            <div className="mt-4 bg-[#fdf9f0] border-2 border-[#7d5231] p-3.5 rounded-2xl shadow-sm text-xs text-[#7d5231] font-semibold italic max-w-xs mx-auto">
              "Um cantinho acolhedor para focar, aprender e evoluir sem cobranças excessivas." ☕📚
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-[#737970] font-medium z-10">
            © Study Burrow • Foco e Tranquilidade
          </div>
        </div>

        {/* Right Side Login Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#fdf9f0]">
          
          {/* Tab Switcher (Entrar vs Criar Conta) */}
          <div className="flex bg-[#e6e2d9] p-1.5 rounded-2xl border-2 border-[#c2c8be] mb-6 font-bold text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                !isSignUp
                  ? 'bg-[#436444] text-white shadow-md'
                  : 'text-[#424841] hover:bg-[#dddad1]'
              }`}
            >
              Entrar na Toca
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                isSignUp
                  ? 'bg-[#99462a] text-white shadow-md'
                  : 'text-[#424841] hover:bg-[#dddad1]'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <div className="mb-6">
            <h2 className="font-headline text-2xl font-bold text-[#7d5231]">
              {isSignUp ? 'Boas-vindas à Toca! 🌸' : 'Que bom te ver de novo! ☕'}
            </h2>
            <p className="font-body text-xs text-[#424841] mt-1">
              {isSignUp
                ? 'Preencha seus dados para criar o seu espaço de estudo.'
                : 'Digite suas credenciais para acessar seu cantinho.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#ffdad6] text-[#93000a] border-2 border-[#ba1a1a] rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block font-bold text-xs text-[#7d5231] uppercase mb-1">
                  Seu Nome de Estudante:
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-[#7d5231] text-lg">
                    person
                  </span>
                  <input
                    type="text"
                    placeholder="Ex: Nayara, Gabriel, Lucas..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-2 border-[#c2c8be] rounded-xl py-2.5 pl-10 pr-3 font-body text-sm focus:outline-none focus:border-[#436444]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-xs text-[#7d5231] uppercase mb-1">
                E-mail de Acesso:
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-[#7d5231] text-lg">
                  mail
                </span>
                <input
                  type="email"
                  placeholder="estudante@toca.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-2 border-[#c2c8be] rounded-xl py-2.5 pl-10 pr-3 font-body text-sm focus:outline-none focus:border-[#436444]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-xs text-[#7d5231] uppercase mb-1">
                Sua Senha:
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-[#7d5231] text-lg">
                  lock
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-2 border-[#c2c8be] rounded-xl py-2.5 pl-10 pr-3 font-body text-sm focus:outline-none focus:border-[#436444]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#424841]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#436444] rounded border-2 border-[#7d5231]"
                />
                Lembrar de mim na Toca
              </label>

              <button
                type="button"
                onClick={() => alert('Dica: Use qualquer e-mail e senha para acessar ou clique em "Entrar como Visitante".')}
                className="text-xs font-bold text-[#99462a] hover:underline cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Main Submit Chunky Button */}
            <button
              type="submit"
              className={`chunky-btn w-full rounded-2xl cursor-pointer pt-2 ${
                isSignUp ? 'btn-secondary' : 'btn-primary'
              }`}
            >
              <span
                className={`chunky-btn-inner text-white font-body font-bold text-sm py-3.5 rounded-2xl flex justify-center items-center gap-2 transition-colors ${
                  isSignUp
                    ? 'bg-[#99462a] hover:bg-[#853c23]'
                    : 'bg-[#436444] hover:bg-[#385439]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {isSignUp ? 'how_to_reg' : 'login'}
                </span>
                {isSignUp ? 'Criar minha Conta e Entrar' : 'Entrar na Toca de Estudos'}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-0.5 bg-[#e6e2d9]" />
            <span className="text-xs font-bold text-[#737970] uppercase">ou</span>
            <div className="flex-1 h-0.5 bg-[#e6e2d9]" />
          </div>

          {/* Quick Demo Guest Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="chunky-btn btn-tertiary w-full rounded-2xl cursor-pointer"
          >
            <span className="chunky-btn-inner bg-[#f1eee5] hover:bg-[#ece8df] text-[#7d5231] border-2 border-[#7d5231] font-body font-bold text-sm py-3 rounded-2xl flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-lg">nature_people</span>
              Entrar como Visitante (Acesso Rápido)
            </span>
          </button>

        </div>
      </div>
    </div>
  );
};
