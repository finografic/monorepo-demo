import { DemoPage as XscanDemoPage } from '@finografic/deps-xscan-demo';
import { DemoLayout } from '@workspace/shared/components';
import '@finografic/deps-xscan-demo/app.css';

const XSCAN_API_BASE_URL = (
  import.meta.env.VITE_DEMO_XSCAN_API_BASE_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  ''
).replace(/\/$/, '');

export function DemoPage() {
  return (
    <DemoLayout
      header={{
        title: 'Demo 3: Supply-Chain Security Scanner',
        subtitle: 'xscan · GitHub lockfiles · Dependency tree analysis',
      }}
      footer={<p className="text-sm text-primary-foreground">Hosted xscan API · Supply-chain scan</p>}
    >
      <XscanDemoPage apiBaseUrl={XSCAN_API_BASE_URL} />
    </DemoLayout>
  );
}
