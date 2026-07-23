import { DemoPage as XscanDemoPage } from '@finografic/deps-xscan-demo';
import { DemoLayout } from '@workspace/shared/components';
import '@finografic/deps-xscan-demo/app.css';

function MonitorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-12 text-primary/50"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

const XSCAN_API_BASE_URL = (
  import.meta.env.VITE_DEMO_XSCAN_API_BASE_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  ''
).replace(/\/$/, '');

// deps-xscan-api now runs on the EC2 instance, proxied internally by apps/server at
// /api/xscan/* (see apps/server/src/routes/xscan). No Render.com dependency anymore.
const XSCAN_TEMPORARILY_OFFLINE = false;

export function DemoPage() {
  return (
    <DemoLayout
      header={{
        title: 'Demo 3: Supply-Chain Security Scanner',
        subtitle: 'xscan · GitHub lockfiles · Dependency tree analysis',
      }}
      footer={<p className="text-sm text-primary-foreground">Hosted xscan API · Supply-chain scan</p>}
    >
      {XSCAN_TEMPORARILY_OFFLINE ? (
        <div className="flex min-h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3 px-4 text-center">
            <MonitorIcon />
            <p className="text-sm font-medium text-primary opacity-80">Scanner temporarily offline</p>
            <p className="max-w-md text-xs font-normal text-primary/60">
              The hosted scan backend is being migrated to new infrastructure. Check back soon.
            </p>
          </div>
        </div>
      ) : (
        <XscanDemoPage apiBaseUrl={XSCAN_API_BASE_URL} />
      )}
    </DemoLayout>
  );
}
