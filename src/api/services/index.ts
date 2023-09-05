export const serviceKeys = {
  servicesList: (
    namespace: string,
    { apiKey, workflow }: { apiKey?: string; workflow?: string }
  ) =>
    [
      {
        scope: "service-list",
        apiKey,
        namespace,
        workflow,
      },
    ] as const,
  serviceDetail: (
    namespace: string,
    { apiKey, service }: { apiKey?: string; service: string }
  ) =>
    [
      {
        scope: "service-detail",
        apiKey,
        namespace,
        service,
      },
    ] as const,
  serviceRevisionDetail: (
    namespace: string,
    {
      apiKey,
      service,
      revision,
    }: { apiKey?: string; service: string; revision: string }
  ) =>
    [
      {
        scope: "service-detail-revision",
        apiKey,
        namespace,
        service,
        revision,
      },
    ] as const,
  servicePods: (
    namespace: string,
    {
      apiKey,
      service,
      revision,
    }: { apiKey?: string; service: string; revision: string }
  ) =>
    [
      {
        scope: "service-pods",
        apiKey,
        namespace,
        service,
        revision,
      },
    ] as const,
  podLogs: ({ apiKey, name }: { apiKey?: string; name: string }) =>
    [
      {
        scope: "service-pods-logs",
        apiKey,
        name,
      },
    ] as const,
};
