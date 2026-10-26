import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  ArrowRight,
  Globe2,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const { login, users, isMongoConnected } = useApp();

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
      // Simulate quick secure authentication check
      await new Promise(resolve => setTimeout(resolve, 400));
      const result = await login(email, password);

      if (!result.success) {
        setErrorMessage(result.message || 'Erro ao iniciar sessão.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha na autenticação do sistema.');
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
      {/* Left Column: Visual Banner with Hero image */}
      <div className="relative w-full lg:w-[55%] xl:w-[58%] min-h-[380px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Background Image with optimized styling */}
        <div className="absolute inset-0 z-0">
          <img
            src="/banner.jpg"
            alt="Linhas de Transmissão de Alta Tensão EDM"
            className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.08] scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Gradient overlays for readability and warmth */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/90" />
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/20 to-slate-950/80" />
        </div>

        {/* Top Header on Left Hero */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5 bg-slate-950/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
            <img
              src="/logo-edm.webp"
              alt="Electricidade de Moçambique"
              className="h-9 sm:h-10 w-auto object-contain"
            />
            <div className="border-l border-white/20 pl-3">
              <span className="block text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                EDM Project Hub
              </span>
              <span className="block text-[10px] text-amber-400 font-semibold tracking-wide">
                Portal Integrado de Gestão
              </span>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-300">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isMongoConnected
                  ? 'bg-emerald-400 animate-pulse ring-4 ring-emerald-500/20'
                  : 'bg-amber-400'
              }`}
            />
            {isMongoConnected ? 'Rede & Atlas Online' : 'Modo Operacional'}
          </div>
        </div>

        {/* Center Content on Left Hero */}
        <div className="relative z-10 my-auto py-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#F7942D]/20 to-amber-500/10 border border-[#F7942D]/40 text-[#F7942D] text-xs font-bold uppercase tracking-wider mb-5 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-[#F7942D]" />
            Electricidade de Moçambique, E.P.
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
            Iluminando a Transformação e o{' '}
            <span className="bg-gradient-to-r from-amber-400 via-[#F7942D] to-orange-500 bg-clip-text text-transparent">
              Desenvolvimento
            </span>{' '}
            da Nação.
          </h1>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Plataforma corporativa centralizada para acompanhamento executivo,
            físico, financeiro e temporal de toda a carteira de projectos
            estratégicos de electrificação e geração.
          </p>

          {/* Value points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10">
              <div className="p-2 rounded-lg bg-[#F7942D]/20 text-[#F7942D] shrink-0">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Cobertura Nacional</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  11 províncias conectadas ao sistema integrado.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Painéis em Tempo Real</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cronogramas Gantt, orçamentos e riscos activos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info on Left Hero */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div>
              <span className="block font-black text-white text-base font-mono">15+</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Projectos Estratégicos
              </span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div>
              <span className="block font-black text-amber-400 text-base font-mono">2.5 GW+</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Capacidade Monitorizada
              </span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400">
            © 2026 Electricidade de Moçambique, E.P.
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 bg-slate-900/95 relative">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Form Header */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Acesso Corporativo Seguro
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Iniciar Sessão
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              Introduza as suas credenciais institucionais para aceder ao portal.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-300">
                <span className="font-bold">Aviso: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-300"
              >
                Correio Electrónico Institucional
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
            <div className="space-y-1.5">
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
                  className="text-[11px] text-[#F7942D] hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  Recuperar acesso?
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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-[#F7942D] focus:ring-[#F7942D] focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-300">Manter sessão activa</span>
              </label>

              <span className="text-[11px] text-slate-500 font-mono">
                SSL 256-bit Encrypted
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#F7942D] to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-950/50 hover:shadow-orange-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>A autenticar...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Exclusive Profile for Director */}
          <div className="pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-[#F7942D]" />
                Perfil Autorizado para Acesso:
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                Acesso Exclusivo
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('antonio.nhassego@edm.co.mz')}
              className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center gap-3.5 ${
                email === 'antonio.nhassego@edm.co.mz'
                  ? 'bg-gradient-to-r from-[#F7942D]/20 to-orange-500/10 border-[#F7942D]/60 text-white shadow-md'
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#F7942D] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md">
                AN
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white truncate">Eng. António Nhassego</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F7942D]/30 text-amber-300 border border-[#F7942D]/40">
                    Director
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                  antonio.nhassego@edm.co.mz
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Conselho de Administração / Direcção Executiva
                </p>
              </div>
              {email === 'antonio.nhassego@edm.co.mz' ? (
                <CheckCircle2 className="w-5 h-5 text-[#F7942D] shrink-0" />
              ) : (
                <span className="text-xs text-[#F7942D] font-semibold shrink-0">Preencher</span>
              )}
            </button>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[11px] text-slate-500 pt-2">
            Acesso confidencial e auditado pela Direcção de Tecnologias de Informação e Telecomunicações (DTIT) da EDM.
          </div>
        </div>
      </div>

      {/* Help / Password Recovery Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F7942D]/20 text-[#F7942D]">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Recuperação de Acesso Corporativo
                </h3>
                <p className="text-xs text-slate-400">
                  Electricidade de Moçambique, E.P.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              O acesso a esta plataforma é sincronizado com o diretório ativo da EDM (Active Directory / LDAP corporativo). Se esqueceu a sua palavra-passe ou necessita de novos privilégios de acesso:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold">Helpdesk DTIT:</span>
                <span className="font-mono text-[#F7942D] font-bold">+258 21 353 600</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold">Correio de Suporte:</span>
                <span className="font-mono text-slate-300">suporte.sistemas@edm.co.mz</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold">Localização:</span>
                <span className="text-slate-400">Edifício Sede EDM, Maputo</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              💡 Para efeitos de teste e demonstração neste ambiente, utilize qualquer uma das contas predefinidas ou a palavra-passe padrão <strong>edm2026</strong>.
            </p>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Compreendi, Voltar ao Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
