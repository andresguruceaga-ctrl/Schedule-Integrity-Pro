import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { ScheduleAnalysis, AnalysisResult } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Calendar,
  Activity,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  Radar as RadarIcon,
  List,
} from 'lucide-react';

interface AnalysisDashboardProps {
  analysis: ScheduleAnalysis | null;
  savedAnalyses: ScheduleAnalysis[];
  onSaveAnalysis: (analysis: ScheduleAnalysis) => void;
}

const COLORS = {
  ok: '#22c55e',
  warning: '#f59e0b',
  critical: '#ef4444',
  excellent: '#22c55e',
  good: '#3b82f6',
  fair: '#f59e0b',
  poor: '#ef4444',
};

export function AnalysisDashboard({ analysis, savedAnalyses, onSaveAnalysis }: AnalysisDashboardProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'details' | 'comparison'>('overview');

  if (!analysis) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay análisis disponible</p>
          <p className="text-sm text-muted-foreground">Ejecuta un análisis para ver los resultados</p>
        </div>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-500">Excelente</Badge>;
      case 'good':
        return <Badge className="bg-blue-500">Bueno</Badge>;
      case 'fair':
        return <Badge className="bg-yellow-500">Aceptable</Badge>;
      default:
        return <Badge className="bg-red-500">Necesita Mejoras</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  // Datos para gráficos
  const statusData = [
    { name: 'OK', value: analysis.categoryResults.reduce((sum, cat) => sum + cat.results.filter(r => r.status === 'ok').length, 0), color: COLORS.ok },
    { name: 'Advertencias', value: analysis.categoryResults.reduce((sum, cat) => sum + cat.results.filter(r => r.status === 'warning').length, 0), color: COLORS.warning },
    { name: 'Críticos', value: analysis.categoryResults.reduce((sum, cat) => sum + cat.results.filter(r => r.status === 'critical').length, 0), color: COLORS.critical },
  ];

  const categoryScoresData = analysis.categoryResults.map(cat => ({
    name: cat.categoryId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    score: cat.score,
    fullMark: 100,
  }));

  const radarData = analysis.categoryResults.map(cat => ({
    subject: cat.categoryId.substring(0, 8),
    A: cat.score,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Header con puntaje general */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(analysis.overallScore / 100) * 351.86} 351.86`}
                    className={getScoreColor(analysis.overallScore)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                  </span>
                  <span className="text-xs text-muted-foreground">Puntaje</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{analysis.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(analysis.status)}
                  <span className="text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {analysis.date.toLocaleDateString()} {analysis.date.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{analysis.totalActivities}</p>
                    <p className="text-xs text-muted-foreground">Actividades</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{analysis.totalRelationships}</p>
                    <p className="text-xs text-muted-foreground">Relaciones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{analysis.criticalActivities}</p>
                    <p className="text-xs text-muted-foreground">Críticas</p>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={() => onSaveAnalysis(analysis)} variant="outline">
              Guardar Análisis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de visualización */}
      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as 'overview' | 'details' | 'comparison')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="details">
            <List className="w-4 h-4 mr-2" />
            Detalles
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <TrendingUp className="w-4 h-4 mr-2" />
            Comparación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Gráfico de radar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <RadarIcon className="w-4 h-4" />
                  Puntajes por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Puntaje"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de pastel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" />
                  Distribución de Estados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de barras de categorías */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Puntaje por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryScoresData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {categoryScoresData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 90 ? COLORS.ok : entry.score >= 70 ? COLORS.warning : COLORS.critical} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Accordion type="multiple" className="space-y-2">
            {analysis.categoryResults.map((category) => (
              <AccordionItem key={category.categoryId} value={category.categoryId} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(category.score >= 90 ? 'ok' : category.score >= 70 ? 'warning' : 'critical')}
                      <span className="font-medium capitalize">{category.categoryId.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={category.score >= 90 ? 'default' : category.score >= 70 ? 'secondary' : 'destructive'}>
                        {category.score}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {category.results.filter(r => r.status === 'critical').length} críticos
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pb-4">
                    {category.results.map((result) => (
                      <ResultDetail key={result.criterionId} result={result} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="comparison">
          {savedAnalyses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Comparación de Análisis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[analysis, ...savedAnalyses].slice(0, 5).map(a => ({
                    name: a.name.substring(0, 15),
                    puntaje: a.overallScore,
                    actividades: a.totalActivities,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="puntaje" fill="#3b82f6" name="Puntaje" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No hay análisis guardados para comparar</p>
              <p className="text-sm text-muted-foreground mt-1">
                Guarda análisis para ver comparaciones históricas
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResultDetail({ result }: { result: AnalysisResult }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border rounded-md p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {result.status === 'ok' ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : result.status === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <div>
            <p className="font-medium text-sm capitalize">{result.criterionId.replace(/_/g, ' ')}</p>
            <p className="text-xs text-muted-foreground">{result.message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={result.status === 'ok' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}>
            {Math.round(result.score)}%
          </Badge>
          {result.details && result.details.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </Button>
          )}
        </div>
      </div>
      {showDetails && result.details && (
        <div className="mt-2 pl-7 space-y-1">
          {result.details.map((detail, idx) => (
            <p key={idx} className="text-xs text-muted-foreground">• {detail}</p>
          ))}
        </div>
      )}
    </div>
  );
}
