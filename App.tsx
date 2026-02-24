import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useScheduleAnalysis } from '@/hooks/useScheduleAnalysis';
import { FileUploader } from '@/components/FileUploader';
import { CriteriaConfig } from '@/components/CriteriaConfig';
import { AnalysisDashboard } from '@/components/AnalysisDashboard';
import { sampleScheduleData } from '@/data/defaultConfig';
import {
  Play,
  Settings,
  BarChart3,
  Upload,
  FileCheck,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
} from 'lucide-react';
import './App.css';

function App() {
  const {
    config,
    analysis,
    savedAnalyses,
    scheduleData,
    stats,
    runAnalysis,
    saveAnalysis,
    updateCriterion,
    updateCategory,
    exportConfig,
    importConfig,
    loadScheduleData,
    resetConfig,
  } = useScheduleAnalysis();

  const [activeTab, setActiveTab] = useState('upload');

  const handleRunAnalysis = () => {
    runAnalysis();
    setActiveTab('results');
  };

  const handleLoadDemo = () => {
    loadScheduleData(sampleScheduleData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Schedule Integrity Pro
                </h1>
                <p className="text-xs text-muted-foreground">Verificación Avanzada de Cronogramas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {analysis && (
                <div className="flex items-center gap-2">
                  <Badge variant={analysis.overallScore >= 90 ? 'default' : analysis.overallScore >= 70 ? 'secondary' : 'destructive'}>
                    Puntaje: {analysis.overallScore}%
                  </Badge>
                </div>
              )}
              <Button
                onClick={handleRunAnalysis}
                disabled={!scheduleData.activities.length}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Ejecutar Análisis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalOk}</p>
                  <p className="text-sm text-muted-foreground">Verificaciones OK</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalWarnings}</p>
                  <p className="text-sm text-muted-foreground">Advertencias</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCritical}</p>
                  <p className="text-sm text-muted-foreground">Problemas Críticos</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalChecks}</p>
                  <p className="text-sm text-muted-foreground">Total Verificaciones</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Cargar Cronograma
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2">
              <Settings className="w-4 h-4" />
              Configurar Criterios
            </TabsTrigger>
            <TabsTrigger value="results" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Resultados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Carga tu Cronograma</h2>
                <p className="text-muted-foreground mb-6">
                  Sube tu archivo de cronograma para analizar su integridad según las mejores prácticas de planificación.
                </p>
                <FileUploader onFileLoad={loadScheduleData} onLoadDemo={handleLoadDemo} />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Características
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Análisis Completo</p>
                          <p className="text-sm text-muted-foreground">
                            25+ criterios de verificación en 8 categorías
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Criterios Configurables</p>
                          <p className="text-sm text-muted-foreground">
                            Personaliza umbrales, pesos y activación de criterios
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Múltiples Formatos</p>
                          <p className="text-sm text-muted-foreground">
                            Soporte para Primavera P6 (.xer) y MS Project (.xml)
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Visualización Avanzada</p>
                          <p className="text-sm text-muted-foreground">
                            Gráficos, dashboards y comparación de análisis
                          </p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Categorías de Análisis</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {config.categories.map((cat) => (
                        <div
                          key={cat.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border ${
                            cat.enabled ? 'bg-white' : 'bg-muted'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              cat.enabled ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                          <span className="text-sm">{cat.name}</span>
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {cat.weight}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <CriteriaConfig
              config={config}
              onUpdateCategory={updateCategory}
              onUpdateCriterion={updateCriterion}
              onExport={exportConfig}
              onImport={importConfig}
              onReset={resetConfig}
            />
          </TabsContent>

          <TabsContent value="results">
            <AnalysisDashboard
              analysis={analysis}
              savedAnalyses={savedAnalyses}
              onSaveAnalysis={saveAnalysis}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Schedule Integrity Pro - Herramienta de verificación de cronogramas
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {scheduleData.activities.length} actividades cargadas
              </span>
              {savedAnalyses.length > 0 && (
                <Badge variant="secondary">
                  {savedAnalyses.length} análisis guardados
                </Badge>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
