{{- define "althea-backend.name" -}}
{{- .Chart.Name }}
{{- end }}

{{- define "althea-backend.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "althea-backend.labels" -}}
app.kubernetes.io/name: {{ include "althea-backend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "althea-backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "althea-backend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
