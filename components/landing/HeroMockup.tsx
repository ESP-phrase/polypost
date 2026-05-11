/**
 * Decorative composer-style preview shown in the landing hero.
 * Mirrors the actual app composer UI so visitors see the real product.
 */
import { PROVIDERS, type ProviderId } from "@/lib/providers";
import { SocialLogo } from "@/components/SocialLogo";
import { BrandMark } from "@/components/BrandMark";

export function HeroMockup() {
  const enabledProviders: ProviderId[] = ["twitter", "linkedin", "instagram", "threads", "bluesky"];
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 -z-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgba(190, 248, 72, 0.18), transparent 70%)",
        }}
      />
      <div className="relative bg-[#0a0a0a] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="grid grid-cols-[150px_1fr] min-h-[440px]">
          {/* Sidebar */}
          <aside className="bg-[var(--color-bg-2)] border-r border-[var(--color-border)] p-3 flex flex-col">
            <div className="flex items-center gap-1.5 px-2 py-1.5 mb-3">
              <BrandMark size={20} />
              <span className="font-extrabold text-xs tracking-tight">polypost<span className="text-[var(--color-accent)]">.</span></span>
            </div>
            <NavItem label="Compose" active />
            <NavItem label="Queue" badge="12" />
            <NavItem label="History" />
            <NavItem label="Connections" />
            <NavItem label="Analytics" />
            <NavItem label="Settings" />
            <div className="mt-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent grid place-items-center text-[0.6rem] font-black text-black">
                A
              </span>
              <div className="leading-tight">
                <div className="text-[0.6rem] font-bold">Aubrey N.</div>
                <div className="text-[0.55rem] text-[var(--color-muted)]">Pro · 7 accounts</div>
              </div>
            </div>
          </aside>

          {/* Composer */}
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <div>
                <div className="font-extrabold text-base flex items-center gap-1.5">
                  New post <span className="text-accent">✦</span>
                </div>
                <div className="text-[var(--color-muted)] text-[0.6rem]">
                  Write once · ships to {enabledProviders.length} platforms
                </div>
              </div>
              <div className="flex gap-1.5">
                <FakeBtn>Save draft</FakeBtn>
                <FakeBtn primary>Schedule →</FakeBtn>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-3">
              <div className="text-[0.7rem] leading-relaxed">
                <span className="text-[var(--color-text)]">Just shipped PolyPost — write once, post to seven networks at once.</span>{" "}
                <span className="text-[var(--color-muted)]">No more copy-pasting. No more &quot;sorry, missed your DM&quot;. </span>
                <span className="text-[var(--color-muted)]">Try it free →</span>
                <span className="inline-block w-1.5 h-3 bg-accent ml-0.5 align-middle animate-pulse" />
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--color-border)]">
                <div className="flex gap-2 text-[var(--color-muted)] text-[0.6rem]">
                  <span>📷 Image</span>
                  <span>🎬 Video</span>
                  <span>🔗 Link</span>
                  <span>😀 Emoji</span>
                </div>
                <div className="text-[var(--color-muted)] text-[0.6rem]">142 / 280</div>
              </div>
            </div>

            {/* Per-platform preview chips */}
            <div className="grid grid-cols-5 gap-1.5">
              {enabledProviders.map((id) => {
                const p = PROVIDERS[id];
                return (
                  <div
                    key={id}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-2 flex flex-col items-center gap-1.5"
                  >
                    <SocialLogo provider={id} size={22} variant="chip" />
                    <div className="text-[0.55rem] font-semibold truncate w-full text-center">
                      {p.label}
                    </div>
                    <div className="text-[0.5rem] text-[var(--color-accent)] font-bold uppercase tracking-wider">
                      Ready
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Schedule row */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-2 flex items-center gap-2 text-[0.6rem]">
              <div className="bg-accent-dim text-accent border border-accent-border rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-[0.5rem]">
                Scheduled
              </div>
              <span className="text-[var(--color-text)]">Today · 4:30 PM</span>
              <span className="text-[var(--color-muted)]">·</span>
              <span className="text-[var(--color-muted)]">in 2h 14m</span>
              <span className="ml-auto text-accent text-[0.55rem]">Edit time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ label, active, badge }: { label: string; active?: boolean; badge?: string }) {
  return (
    <div
      className={`flex items-center justify-between gap-1.5 px-2 py-1.5 rounded text-[0.65rem] font-medium mb-0.5 ${
        active ? "bg-accent text-black font-bold" : "text-[var(--color-muted)]"
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-sm bg-current/20" />
        {label}
      </span>
      {badge && (
        <span className="bg-[var(--color-surface-3)] text-[var(--color-text)] rounded px-1.5 py-0.5 text-[0.5rem] font-bold">
          {badge}
        </span>
      )}
    </div>
  );
}

function FakeBtn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <span
      className={`text-[0.6rem] px-2 py-1 rounded-md font-bold ${
        primary
          ? "bg-accent text-black"
          : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)]"
      }`}
    >
      {children}
    </span>
  );
}
