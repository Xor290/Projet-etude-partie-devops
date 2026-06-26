{{- define "althea-frontend.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "althea-frontend.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "althea-frontend.labels" -}}
app.kubernetes.io/name: {{ include "althea-frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "althea-frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "althea-frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
