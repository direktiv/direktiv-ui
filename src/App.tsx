import "./App.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useApiKeyState, useThemeState } from "./util/store";

import { useNamespaces } from "./api/namespaces";
import { useVersion } from "./api/version";

const queryClient = new QueryClient();

function App() {
  const apiKey = useApiKeyState((state) => state.apiKey);
  const setApiKey = useApiKeyState((state) => state.actions.setApiKey);
  const theme = useThemeState((state) => state.theme);
  const setTheme = useThemeState((state) => state.actions.setTheme);
  const { data: version, isLoading: isVersionLoading } = useVersion();
  const { data: namespaces, isLoading: isLoadingNamespaces } = useNamespaces();

  return (
    <div className="flex flex-col space-y-5 p-10">
      <div>
        <h1>
          theme <span className="font-bold">{theme}</span>
        </h1>
        <div className="flex space-x-5">
          <button className="btn btn-primary" onClick={() => setTheme("dark")}>
            darkmode
          </button>
          <button className="btn btn-primary" onClick={() => setTheme("light")}>
            lightmode
          </button>
          <button className="btn btn-error" onClick={() => setTheme(null)}>
            reset theme
          </button>
        </div>
      </div>
      <div>
        <h1>
          api key is <span className="font-bold">{apiKey}</span>
        </h1>
        <div className="flex space-x-5">
          <button
            className="btn btn-primary"
            onClick={() => setApiKey("password")}
          >
            set Api key to password
          </button>
          <button className="btn btn-error" onClick={() => setApiKey(null)}>
            reset api key
          </button>
        </div>
      </div>
      <div>
        <h1 className="font-bold">Version</h1>
        {isVersionLoading ? "Loading version...." : version?.api}
      </div>
      <div>
        <h1 className="font-bold">namespaces</h1>
        {isLoadingNamespaces
          ? "Loading namespaces"
          : namespaces?.results.map((namespace) => (
              <div key={namespace.name}>{namespace.name}</div>
            ))}
      </div>
    </div>
  );
}

const AppWithQueryProvider = () => (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

export default AppWithQueryProvider;
