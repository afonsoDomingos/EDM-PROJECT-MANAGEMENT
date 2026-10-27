import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const { login, isMongoConnected } = useApp();

  const [email, setEmail] = useState('antonio.nhassego@edm.co.mz');
  const [password, setPassword] = useState('edm2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 350));
      const result = await login(email, password);

      if (!result.success) {
        setErrorMessage(result.message || 'Credenciais inválidas.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('edm2026');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans selection:bg-[#F7942D] selection:text-white">
      {/* Left Column: Visual Banner with Sunset Transmission Pylons */}
      <div className="relative w-full lg:w-[55%] xl:w-[58%] min-h-[340px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/banner.jpg"
            alt="Linhas de Transmissão EDM"
            className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.08] scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/90" />
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/20 to-slate-950/80" />
        </div>

        {/* Top Header on Left Hero */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-2xl">
            <img
              src="/logo-edm.webp"
              alt="Electricidade de Moçambique"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <div className="border-l border-white/20 pl-2.5">
              <span className="block text-white font-extrabold text-xs tracking-wider uppercase">
                EDM Project Hub
              </span>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-xs text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isMongoConnected
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            {isMongoConnected ? 'Atlas Online' : 'Operacional'}
          </div>
        </div>

        {/* Center Content on Left Hero: Clean & Direct */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7942D]/20 border border-[#F7942D]/40 text-[#F7942D] text-[11px] font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
            <Zap className="w-3 h-3 text-[#F7942D]" />
            Electricidade de Moçambique, E.P.
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
            Iluminando a Transformação e o{' '}
            <span className="bg-gradient-to-r from-amber-400 via-[#F7942D] to-orange-500 bg-clip-text text-transparent">
              Desenvolvimento
            </span>{' '}
            da Nação.
          </h1>

          <p className="mt-3 text-slate-300 text-sm font-medium">
            Gestão e acompanhamento executivo de projectos estratégicos.
          </p>
        </div>

        {/* Footer info on Left Hero: Minimalist */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white font-mono">15+ Projectos</span>
            <span className="text-slate-600">•</span>
            <span className="font-bold text-amber-400 font-mono">2.5 GW+</span>
          </div>

          <span className="text-[11px] text-slate-400">
            © 2026 EDM
          </span>
        </div>
      </div>

      {/* Right Column: Clean Authentication Form */}
      <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 bg-slate-900/95 relative">
        <div className="w-full max-w-sm mx-auto space-y-5">
          {/* Form Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Iniciar Sessão
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Acesso ao Portal Corporativo de Gestão
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="text-xs text-red-300 font-medium">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Field */}
            <div className="space-y-1">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-300"
              >
                Email Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nome.apelido@edm.co.mz"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#F7942D] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-300"
                >
                  Palavra-passe
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-[11px] text-[#F7942D] hover:underline"
                >
                  Recuperar?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#F7942D] focus:border-transparent transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-[#F7942D] focus:ring-[#F7942D] focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-400">Manter sessão activa</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#F7942D] to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold text-sm shadow-md hover:shadow-orange-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>A entrar...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Director Card - Clean & Compact */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => handleSelectDemoUser('antonio.nhassego@edm.co.mz')}
              className={`w-full text-left p-3 rounded-2xl border transition flex items-center gap-3 cursor-pointer ${
                email === 'antonio.nhassego@edm.co.mz'
                  ? 'bg-[#F7942D]/15 border-[#F7942D]/50 text-white shadow-md'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#F7942D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                AN
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">Eng. António Nhassego</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Director
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  antonio.nhassego@edm.co.mz
                </p>
              </div>
              {email === 'antonio.nhassego@edm.co.mz' && (
                <CheckCircle2 className="w-4 h-4 text-[#F7942D] shrink-0" />
              )}
            </button>
          </div>

          {/* Footer Note with Powered by MUV */}
          <div className="text-center pt-2 space-y-2">
            <div className="inline-flex items-center gap-2 bg-slate-900/90 px-3.5 py-1 rounded-full border border-slate-800 shadow-xs select-none">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Powered by
              </span>
              <img
                src="/muv logo.png"
                alt="MUV Educação & Engenharia"
                className="h-5 w-auto object-contain bg-white/95 px-1.5 py-0.5 rounded"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              EDM • Direcção de Tecnologias de Informação (DTIT)
            </p>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center gap-2.5">
              <Info className="w-5 h-5 text-[#F7942D]" />
              <h3 className="text-sm font-bold text-white">
                Suporte de Acesso
              </h3>
            </div>

            <p className="text-xs text-slate-300">
              O acesso ao sistema é gerido pela Direcção de TI (DTIT). Contacte o suporte em caso de dificuldades.
            </p>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Helpdesk:</span>
                <span className="font-mono text-[#F7942D] font-bold">+258 21 353 600</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Email:</span>
                <span className="font-mono text-slate-400">suporte@edm.co.mz</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
