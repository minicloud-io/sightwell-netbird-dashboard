{{- define "sc.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "sc.fullname" -}}
{{- printf "%s" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "sc.labels" -}}
app.kubernetes.io/name: {{ include "sc.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version }}
{{- end -}}

{{- define "sc.selector" -}}
app.kubernetes.io/name: {{ include "sc.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "sc.image" -}}
{{- if .digest -}}
{{ .repository }}@{{ .digest }}
{{- else -}}
{{ .repository }}:{{ .tag }}
{{- end -}}
{{- end -}}

{{- define "sc.baseURL" -}}
https://{{ .Values.domain }}
{{- end -}}

{{- define "sc.issuer" -}}
{{- default (printf "%s/oauth2" (include "sc.baseURL" .)) .Values.server.auth.issuer -}}
{{- end -}}

{{- define "sc.serverConfig" -}}
{{- $base := include "sc.baseURL" . -}}
server:
  listenAddress: ":{{ .Values.server.containerPort }}"
  exposedAddress: {{ printf "%s:443" $base | quote }}
  metricsPort: 9090
  healthcheckAddress: ":9000"
  logLevel: "info"
  logFile: "console"
  authSecret: {{ required "server.authSecret is required (openssl rand -base64 32)" .Values.server.authSecret | quote }}
  dataDir: "/var/lib/netbird"
  stunPorts: {{ toJson .Values.server.stunPorts }}
{{- with .Values.server.stuns }}
  stuns: {{ toJson . }}
{{- end }}
  auth:
    issuer: {{ include "sc.issuer" . | quote }}
    localAuthDisabled: {{ .Values.server.auth.localAuthDisabled }}
    signKeyRefreshEnabled: {{ .Values.server.auth.signKeyRefreshEnabled }}
{{- with .Values.server.auth.sessionCookieEncryptionKey }}
    sessionCookieEncryptionKey: {{ . | quote }}
{{- end }}
    dashboardRedirectURIs:
{{- if .Values.server.auth.dashboardRedirectURIs }}
{{- range .Values.server.auth.dashboardRedirectURIs }}
      - {{ . | quote }}
{{- end }}
{{- else }}
      - {{ printf "%s/nb-auth" $base | quote }}
      - {{ printf "%s/nb-silent-auth" $base | quote }}
{{- end }}
    dashboardPostLogoutRedirectURIs:
      - {{ printf "%s/" $base | quote }}
    cliRedirectURIs:
{{- range .Values.server.auth.cliRedirectURIs }}
      - {{ . | quote }}
{{- end }}
{{- with .Values.server.auth.owner }}
    owner: {{ toJson . }}
{{- end }}
{{- if .Values.server.auth.theme.enabled }}
    theme:
      dir: {{ .Values.server.auth.theme.mountPath | quote }}
      name: {{ .Values.server.auth.theme.name | quote }}
      displayName: {{ .Values.server.auth.theme.displayName | quote }}
{{- end }}
  store:
    engine: {{ .Values.server.store.engine | quote }}
    dsn: {{ .Values.server.store.dsn | quote }}
    encryptionKey: {{ required "server.store.encryptionKey is required (openssl rand -base64 32); without it the server generates a new key on every start" .Values.server.store.encryptionKey | quote }}
{{- with .Values.server.extraConfig }}
{{ toYaml . | indent 2 }}
{{- end }}
{{- end -}}
