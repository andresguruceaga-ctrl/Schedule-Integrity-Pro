import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card'; // Ajustado
import { Button } from './button'; // Ajustado
import { Input } from './input'; // Ajustado
import { Label } from './label'; // Ajustado
import { Switch } from './switch'; // Ajustado
import { Slider } from './slider'; // Ajustado
import { Badge } from './badge'; // Ajustado
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'; // Ajustado
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog'; // Ajustado
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'; // Ajustado
import type { CategoryConfig, CriterionConfig, UserConfig } from './types'; // Ajustado (asumiendo que types.ts está en la raíz)
import { Settings, Download, Upload, RotateCcw, ChevronDown } from 'lucide-react';

interface CriteriaConfigProps {
  config: UserConfig;
  onUpdateCategory: (categoryId: string, updates: Partial<CategoryConfig>) => void;
  onUpdateCriterion: (categoryId: string, criterionId: string, updates: Partial<CriterionConfig>) => void;
  onExport: () => string;
  onImport: (json: string) => boolean;
  onReset: () => void;
}

export function CriteriaConfig({
  config,
  onUpdateCategory,
  onUpdateCriterion,
  onExport,
  onImport,
  onReset,
}: CriteriaConfigProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    const json = onExport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const success = onImport(importText);
    if (success) {
      setImportDialogOpen(false);
      setImportText('');
      setImportError(null);
    } else {
      setImportError('JSON inválido. Por favor verifica el formato.');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración de Criterios
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Personaliza los criterios de verificación y sus umbrales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Configuración</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <textarea
                  className="w-full h-48 p-3 text-sm font-mono border rounded-md"
                  placeholder="Pega aquí el JSON de configuración..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
                {importError && (
                  <p className="text-sm text-red-500">{importError}</p>
                )}
                <Button onClick={handleImport} className="w-full">
                  Importar Configuración
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="thresholds">Umbrales Globales</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <Accordion type="multiple" className="space-y-2">
              {config.categories.map((category) => (
                <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={category.enabled}
                          onCheckedChange={(checked) =>
                            onUpdateCategory(category.id, { enabled: checked })
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Peso: {category.weight}%
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {category.criteria.filter(c => c.enabled).length}/{category.criteria.length} criterios
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pb-4">
                      <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-md">
                        <div>
                          <Label className="text-xs">Peso en el puntaje global</Label>
                          <div className="flex items-center gap-3 mt-1">
                            <Slider
                              value={[category.weight]}
                              onValueChange={([value]) =>
                                onUpdateCategory(category.id, { weight: value })
                              }
                              min={0}
                              max={50}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-sm w-10">{category.weight}%</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Descripción</Label>
                          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Criterios de Verificación</Label>
                        {category.criteria.map((criterion) => (
                          <CriterionEditor
                            key={criterion.id}
                            criterion={criterion}
                            onUpdate={(updates) =>
                              onUpdateCriterion(category.id, criterion.id, updates)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="thresholds">
            <div className="grid grid-cols-3 gap-6 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <Label>Excelente</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Puntaje mínimo: {config.globalThresholds.excellent}%
                </p>
                <Slider
                  value={[config.globalThresholds.excellent]}
                  min={80}
                  max={100}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <Label>Bueno</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Puntaje mínimo: {config.globalThresholds.good}%
                </p>
                <Slider
                  value={[config.globalThresholds.good]}
                  min={60}
                  max={90}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <Label>Aceptable</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Puntaje mínimo: {config.globalThresholds.fair}%
                </p>
                <Slider
                  value={[config.globalThresholds.fair]}
                  min={40}
                  max={75}
                  step={1}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface CriterionEditorProps {
  criterion: CriterionConfig;
  onUpdate: (updates: Partial<CriterionConfig>) => void;
}

function CriterionEditor({ criterion, onUpdate }: CriterionEditorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-md p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch
            checked={criterion.enabled}
            onCheckedChange={(checked) => onUpdate({ enabled: checked })}
          />
          <div>
            <p className="font-medium text-sm">{criterion.name}</p>
            <p className="text-xs text-muted-foreground">{criterion.description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {expanded && (
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <Label className="text-xs">Peso del criterio</Label>
            <div className="flex items-center gap-3 mt-1">
              <Slider
                value={[criterion.weight]}
                onValueChange={([value]) => onUpdate({ weight: value })}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="text-sm w-10">{criterion.weight}%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Umbral Advertencia</Label>
              <Input
                type="number"
                value={criterion.threshold.warning}
                onChange={(e) =>
                  onUpdate({
                    threshold: {
                      ...criterion.threshold,
                      warning: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="mt-1 h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Umbral Crítico</Label>
              <Input
                type="number"
                value={criterion.threshold.critical}
                onChange={(e) =>
                  onUpdate({
                    threshold: {
                      ...criterion.threshold,
                      critical: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="mt-1 h-8"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
