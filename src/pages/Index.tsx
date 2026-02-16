import { useState } from "react";
import { Globe, Loader2, CheckCircle2, XCircle, Clock, ArrowRight, Shield } from "lucide-react";

interface UrlResult {
  url: string;
  status: number;
  statusText: string;
  responseTime: number;
  isUp: boolean;
  checkedAt: string;
}

const Index = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatUrl = (input: string) => {
    let formatted = input.trim();
    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      formatted = "https://" + formatted;
    }
    return formatted;
  };

  const checkUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    const formattedUrl = formatUrl(url);
    const startTime = performance.now();

    try {
      const response = await fetch(formattedUrl, {
        method: "HEAD",
        mode: "no-cors",
        signal: AbortSignal.timeout(10000),
      });

      const responseTime = Math.round(performance.now() - startTime);

      // no-cors returns opaque response (status 0), treat as reachable
      const status = response.status === 0 ? 200 : response.status;
      const statusText = response.status === 0 ? "Reachable" : response.statusText;

      setResult({
        url: formattedUrl,
        status,
        statusText: statusText || "OK",
        responseTime,
        isUp: status < 400,
        checkedAt: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      const responseTime = Math.round(performance.now() - startTime);
      
      if (err instanceof DOMException && err.name === "TimeoutError") {
        setResult({
          url: formattedUrl,
          status: 408,
          statusText: "Timeout",
          responseTime,
          isUp: false,
          checkedAt: new Date().toLocaleTimeString(),
        });
      } else {
        setError("Unable to reach this URL. It may be down or the address is invalid.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-success";
    if (status >= 300 && status < 400) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-[120px]"
        style={{ background: `radial-gradient(ellipse, hsl(var(--primary)), transparent)` }} />

      <div className="relative z-10 w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-border bg-card">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground font-mono">URL Checker</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            Check Any <span className="text-gradient">URL</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Instantly verify if a website is up and running
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={checkUrl} className="relative mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL... e.g. google.com"
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-14 px-6 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all glow-primary"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Check <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div className={`rounded-xl border p-6 ${
            result.isUp 
              ? "border-success/30 bg-success/5 glow-success" 
              : "border-destructive/30 bg-destructive/5 glow-destructive"
          } animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className="flex items-start gap-4">
              {result.isUp ? (
                <CheckCircle2 className="w-8 h-8 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-8 h-8 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold mb-1">
                  {result.isUp ? "Website is UP" : "Website is DOWN"}
                </h2>
                <p className="text-muted-foreground font-mono text-sm truncate mb-4">
                  {result.url}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className={`font-mono font-bold text-lg ${getStatusColor(result.status)}`}>
                      {result.status}
                    </p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Response</p>
                    <p className="font-mono font-bold text-lg text-foreground flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4 text-primary" />
                      {result.responseTime}ms
                    </p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Checked</p>
                    <p className="font-mono font-bold text-sm text-foreground">
                      {result.checkedAt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 glow-destructive animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
              <p className="text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-8 font-mono">
          Checks are performed from your browser • Results may vary by location
        </p>
      </div>
    </div>
  );
};

export default Index;
