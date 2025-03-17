import { ThemeToggleAdvanced } from "../theme/theme-toggle";

export function SampleComponent() {
  return (
    <div className="container mx-auto p-4">
      <div className="navbar bg-base-100">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">daisyUI + Theme Switcher Demo</a>
        </div>
        <div className="flex-none">
          <ThemeToggleAdvanced />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Card Title</h2>
            <p>This is a daisyUI card component that adapts to the current theme.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
        <button className="btn btn-active">Default</button>
        <button className="btn btn-active btn-primary">Primary</button>
        <button className="btn btn-active btn-secondary">Secondary</button>
        <button className="btn btn-active btn-accent">Accent</button>
        <button className="btn btn-active btn-info">Info</button>
        <button className="btn btn-active btn-success">Success</button>
        <button className="btn btn-active btn-warning">Warning</button>
        <button className="btn btn-active btn-error">Error</button>
        </div>
      </div>
    </div>
  );
}
