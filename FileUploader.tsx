import { useState, useCallback } from 'react';
import { Card, CardContent } from './card'; // Ajustado
import { Button } from './button'; // Ajustado
import { Badge } from './badge'; // Ajustado
import { Upload, FileText, X, Database } from 'lucide-react';
import type { ScheduleData, Activity, Relationship, Calendar } from './types'; // Ajustado (asumiendo types.ts en la raíz)

interface FileUploaderProps {
  onFileLoad: (data: ScheduleData) => void;
  onLoadDemo: () => void;
}

export function FileUploader({ onFileLoad, onLoadDemo }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const parseXERContent = (content: string): ScheduleData => {
    const lines = content.split('\n');
    const activities: Activity[] = [];
    const relationships: Relationship[] = [];
    const calendars: Calendar[] = [];
    
    let currentTable = '';
    let headers: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('%T')) {
        currentTable = trimmed.substring(2).trim();
      } else if (trimmed.startsWith('%F')) {
        headers = trimmed.substring(2).split('\t');
      } else if (trimmed.startsWith('%R')) {
        const values = trimmed.substring(2).split('\t');
        
        if (currentTable === 'TASK') {
          const taskId = values[headers.indexOf('task_id')] || '';
          const taskName = values[headers.indexOf('task_name')] || '';
          const duration = parseFloat(values[headers.indexOf('target_dur')] || '0');
          const startDate = new Date(values[headers.indexOf('target_start_date')] || Date.now());
          const endDate = new Date(values[headers.indexOf('target_end_date')] || Date.now());
          const calendarId = values[headers.indexOf('clndr_id')] || '';
          const wbsId = values[headers.indexOf('wbs_id')] || '';
          const totalFloat = parseFloat(values[headers.indexOf('total_float_hr_cnt')] || '0') / 8;
          const percentComplete = parseFloat(values[headers.indexOf('complete_pct')] || '0');
          
          activities.push({
            id: taskId,
            name: taskName,
            duration: isNaN(duration) ? 0 : duration,
            startDate: isNaN(startDate.getTime()) ? new Date() : startDate,
            endDate: isNaN(endDate.getTime()) ? new Date() : endDate,
            calendarId,
            wbsCode: wbsId,
            isCritical: totalFloat === 0,
            totalFloat: isNaN(totalFloat) ? 0 : totalFloat,
            percentComplete: isNaN(percentComplete) ? 0 : percentComplete,
          });
        } else if (currentTable === 'TASKPRED') {
          const predId = values[headers.indexOf('task_pred_id')] || '';
          const predecessor = values[headers.indexOf('pred_task_id')] || '';
          const successor = values[headers.indexOf('task_id')] || '';
          const type = (values[headers.indexOf('pred_type')] || 'FS') as 'FS' | 'SS' | 'FF' | 'SF';
          const lag = parseFloat(values[headers.indexOf('lag_hr_cnt')] || '0') / 8;

          relationships.push({
            id: predId,
            predecessor,
            successor,
            type,
            lag: isNaN(lag) ? 0 : lag,
          });
        }
      }
    }

    return { activities, relationships, calendars };
  };

  const parseXMLContent = (content: string): ScheduleData => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    const activities: Activity[] = [];
    const relationships: Relationship[] = [];
    const calendars: Calendar[] = [];

    const tasks = xmlDoc.getElementsByTagName('Task');
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const uid = task.getElementsByTagName('UID')[0]?.textContent || '';
      const name = task.getElementsByTagName('Name')[0]?.textContent || '';
      const duration = task.getElementsByTagName('Duration')[0]?.textContent || '0';
      const start = task.getElementsByTagName('Start')[0]?.textContent || '';
      const finish = task.getElementsByTagName('Finish')[0]?.textContent || '';
      const percentComplete = task.getElementsByTagName('PercentComplete')[0]?.textContent || '0';
      const critical = task.getElementsByTagName('Critical')[0]?.textContent === '1';
      
      const durationMatch = duration.match(/PT(\d+)H/);
      const durationHours = durationMatch ? parseInt(durationMatch[1]) : 0;
      const durationDays = durationHours / 8;

      activities.push({
        id: uid,
        name,
        duration: durationDays,
        startDate: new Date(start),
        endDate: new Date(finish),
        calendarId: '1',
        wbsCode: '',
        isCritical: critical,
        totalFloat: critical ? 0 : 1,
        percentComplete: parseInt(percentComplete),
      });
    }

    const predecessorLinks = xmlDoc.getElementsByTagName('PredecessorLink');
    for (let i = 0; i < predecessorLinks.length; i++) {
      const pred = predecessorLinks[i];
      const predecessorUid = pred.getElementsByTagName('PredecessorUID')[0]?.textContent || '';
      const taskUid = pred.parentElement?.getElementsByTagName('UID')[0]?.textContent || '';
      const type = (pred.getElementsByTagName('Type')[0]?.textContent || '1');
      const linkType = type === '1' ? 'FS' : type === '2' ? 'SS' : type === '3' ? 'FF' : 'SF';

      relationships.push({
        id: `P${i}`,
        predecessor: predecessorUid,
        successor: taskUid,
        type: linkType as 'FS' | 'SS' | 'FF' | 'SF',
        lag: 0,
      });
    }

    return { activities, relationships, calendars };
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let data: ScheduleData;

        if (file.name.toLowerCase().endsWith('.xer')) {
          data = parseXERContent(content);
        } else if (file.name.toLowerCase().endsWith('.xml')) {
          data = parseXMLContent(content);
        } else {
          setError('Formato de archivo no soportado. Use .xer o .xml');
          return;
        }

        onFileLoad(data);
      } catch (err) {
        setError('Error al parsear el archivo. Verifique el formato.');
      }
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let data: ScheduleData;

        if (file.name.toLowerCase().endsWith('.xer')) {
          data = parseXERContent(content);
        } else if (file.name.toLowerCase().endsWith('.xml')) {
          data = parseXMLContent(content);
        } else {
          setError('Formato de archivo no soportado. Use .xer o .xml');
          return;
        }

        onFileLoad(data);
      } catch (err) {
        setError('Error al parsear el archivo. Verifique el formato.');
      }
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  const clearFile = () => {
    setFileName(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Arrastra tu archivo aquí
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Soporta archivos .xer (Primavera P6) y .xml (MS Project)
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">.xer</Badge>
              <Badge variant="secondary">.xml</Badge>
            </div>
            <div className="mt-4">
              <label>
                <input
                  type="file"
                  accept=".xer,.xml"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button variant="outline" asChild>
                  <span>Seleccionar Archivo</span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {fileName && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium">{fileName}</p>
                  <p className="text-sm text-green-500">Archivo cargado correctamente</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button variant="outline" onClick={onLoadDemo} className="gap-2">
          <Database className="w-4 h-4" />
          Cargar Datos Demo
        </Button>
      </div>
    </div>
  );
}
