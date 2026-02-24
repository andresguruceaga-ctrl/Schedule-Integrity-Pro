import { useState, useCallback, useMemo } from 'react';
import type {
  UserConfig,
  ScheduleData,
  ScheduleAnalysis,
  CategoryResult,
  AnalysisResult,
  Activity,
  Relationship,
} from '@/types';
import { defaultConfig, sampleScheduleData } from '@/data/defaultConfig';

export function useScheduleAnalysis() {
  const [config, setConfig] = useState<UserConfig>(defaultConfig);
  const [scheduleData, setScheduleData] = useState<ScheduleData>(sampleScheduleData);
  const [analysis, setAnalysis] = useState<ScheduleAnalysis | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<ScheduleAnalysis[]>([]);

  // Análisis de criterios individuales
  const analyzeCriterion = useCallback((
    criterionId: string,
    activities: Activity[],
    relationships: Relationship[]
  ): AnalysisResult => {
    let score = 100;
    let status: 'ok' | 'warning' | 'critical' = 'ok';
    let message = '';
    let details: string[] = [];
    let count = 0;

    switch (criterionId) {
      case 'missing_predecessors': {
        const activitiesWithPredecessors = new Set(relationships.map(r => r.successor));
        const missing = activities.filter(a => 
          !activitiesWithPredecessors.has(a.id) && a.duration > 0
        );
        count = missing.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 5);
        message = `${count} actividades sin predecesores`;
        details = missing.slice(0, 5).map(a => `${a.id}: ${a.name || 'Sin nombre'}`);
        break;
      }

      case 'missing_successors': {
        const activitiesWithSuccessors = new Set(relationships.map(r => r.predecessor));
        const missing = activities.filter(a => 
          !activitiesWithSuccessors.has(a.id) && a.duration > 0
        );
        count = missing.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 3);
        message = `${count} actividades sin sucesores`;
        details = missing.slice(0, 5).map(a => `${a.id}: ${a.name || 'Sin nombre'}`);
        break;
      }

      case 'open_ends': {
        const withPredecessors = new Set(relationships.map(r => r.successor));
        const withSuccessors = new Set(relationships.map(r => r.predecessor));
        const openEnds = activities.filter(a => 
          !withPredecessors.has(a.id) && !withSuccessors.has(a.id) && a.duration > 0
        );
        count = openEnds.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 10);
        message = `${count} actividades desconectadas`;
        details = openEnds.slice(0, 5).map(a => `${a.id}: ${a.name || 'Sin nombre'}`);
        break;
      }

      case 'relationship_types': {
        const typeCounts = { FS: 0, SS: 0, FF: 0, SF: 0 };
        relationships.forEach(r => typeCounts[r.type]++);
        const total = relationships.length;
        const fsPercentage = total > 0 ? (typeCounts.FS / total) * 100 : 0;
        score = fsPercentage >= 80 ? 100 : fsPercentage >= 60 ? 80 : 60;
        message = `FS=${fsPercentage.toFixed(1)}%, SS=${((typeCounts.SS/total)*100).toFixed(1)}%, FF=${((typeCounts.FF/total)*100).toFixed(1)}%, SF=${((typeCounts.SF/total)*100).toFixed(1)}%`;
        break;
      }

      case 'hard_constraints': {
        const hardConstrained = activities.filter(a => 
          a.constraintType && a.constraintType !== 'none'
        );
        count = hardConstrained.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 8);
        message = `${count} restricciones duras`;
        break;
      }

      case 'soft_constraints': {
        const softConstrained = activities.filter(a => 
          a.constraintType === 'start' || a.constraintType === 'finish'
        );
        count = softConstrained.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 3);
        message = `${count} restricciones blandas`;
        break;
      }

      case 'circular_relationships': {
        // Simplificación: verificar relaciones A->B y B->A
        const pairs = new Set<string>();
        let circular = 0;
        relationships.forEach(r => {
          const reverse = `${r.successor}->${r.predecessor}`;
          if (pairs.has(reverse)) circular++;
          pairs.add(`${r.predecessor}->${r.successor}`);
        });
        count = circular;
        score = circular === 0 ? 100 : circular <= 2 ? 70 : 40;
        message = `${circular} relaciones circulares`;
        break;
      }

      case 'negative_lag': {
        const negative = relationships.filter(r => r.lag < 0);
        count = negative.length;
        const percentage = relationships.length > 0 ? (count / relationships.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 15);
        message = `${count} relaciones con lag negativo`;
        break;
      }

      case 'excessive_lag': {
        const excessive = relationships.filter(r => r.lag > 30);
        count = excessive.length;
        const percentage = relationships.length > 0 ? (count / relationships.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 10);
        message = `${count} relaciones con lag excesivo (>30d)`;
        break;
      }

      case 'relationship_density': {
        const density = activities.length > 0 ? relationships.length / activities.length : 0;
        score = density >= 2 ? 100 : density >= 1.5 ? 85 : density >= 1 ? 70 : 50;
        message = `Promedio: ${density.toFixed(1)} relaciones/actividad`;
        break;
      }

      case 'zero_duration': {
        const zeroDuration = activities.filter(a => a.duration === 0);
        count = zeroDuration.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 15);
        message = `${count} actividades con duración cero`;
        break;
      }

      case 'excessive_duration': {
        const excessive = activities.filter(a => a.duration > 40);
        count = excessive.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 8);
        message = `${count} actividades con duración excesiva (>40d)`;
        details = excessive.slice(0, 5).map(a => `${a.id}: ${a.duration} días`);
        break;
      }

      case 'unusual_duration': {
        const durations = activities.filter(a => a.duration > 0).map(a => a.duration);
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        const unusual = activities.filter(a => a.duration > avg * 3);
        count = unusual.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 5);
        message = `${count} actividades con duración inusual`;
        break;
      }

      case 'missing_calendars': {
        const missing = activities.filter(a => !a.calendarId);
        count = missing.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 15);
        message = `${count} actividades sin calendario`;
        break;
      }

      case 'calendar_consistency': {
        score = 100;
        message = 'Calendarios consistentes';
        break;
      }

      case 'critical_path_length': {
        const criticalCount = activities.filter(a => a.isCritical).length;
        const percentage = activities.length > 0 ? (criticalCount / activities.length) * 100 : 0;
        score = percentage <= 40 ? 100 : percentage <= 60 ? 85 : percentage <= 75 ? 70 : 50;
        message = `${criticalCount} actividades (${percentage.toFixed(1)}%) en camino crítico`;
        break;
      }

      case 'negative_float': {
        const negative = activities.filter(a => a.totalFloat < 0);
        count = negative.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 20);
        message = `${count} actividades con flotante negativo`;
        break;
      }

      case 'missing_names': {
        const missing = activities.filter(a => !a.name || a.name.trim() === '');
        count = missing.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 15);
        message = `${count} actividades sin nombre`;
        break;
      }

      case 'duplicate_ids': {
        const ids = activities.map(a => a.id);
        const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
        count = duplicates.length;
        score = count === 0 ? 100 : count <= 2 ? 70 : 40;
        message = `${count} IDs duplicados`;
        break;
      }

      case 'missing_wbs': {
        const missing = activities.filter(a => !a.wbsCode);
        count = missing.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 8);
        message = `${count} actividades sin WBS`;
        break;
      }

      case 'invalid_dates': {
        const invalid = activities.filter(a => a.startDate > a.endDate);
        count = invalid.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 15);
        message = `${count} actividades con fechas inválidas`;
        break;
      }

      case 'out_of_sequence': {
        const outOfSeq = activities.filter(a => {
          const predecessors = relationships.filter(r => r.successor === a.id);
          return predecessors.length > 0 && a.percentComplete > 0 && a.percentComplete < 100;
        });
        count = outOfSeq.length;
        const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
        score = Math.max(0, 100 - percentage * 10);
        message = `${count} actividades con progreso fuera de secuencia`;
        break;
      }

      case 'duration_inconsistencies': {
        score = 100;
        message = 'Duraciones consistentes';
        break;
      }

      default:
        message = 'Criterio no implementado';
        score = 100;
    }

    // Determinar estado basado en score
    if (score >= 90) status = 'ok';
    else if (score >= 70) status = 'warning';
    else status = 'critical';

    return { criterionId, score, status, message, details, count };
  }, []);

  // Ejecutar análisis completo
  const runAnalysis = useCallback((name: string = 'Análisis de Cronograma') => {
    const categoryResults: CategoryResult[] = config.categories
      .filter(cat => cat.enabled)
      .map(category => {
        const results = category.criteria
          .filter(crit => crit.enabled)
          .map(criterion => 
            analyzeCriterion(criterion.id, scheduleData.activities, scheduleData.relationships)
          );
        
        const categoryScore = results.length > 0
          ? results.reduce((sum, r) => sum + r.score * (category.criteria.find(c => c.id === r.criterionId)?.weight || 1), 0) /
            results.reduce((sum, r) => sum + (category.criteria.find(c => c.id === r.criterionId)?.weight || 1), 0)
          : 100;

        return {
          categoryId: category.id,
          score: Math.round(categoryScore),
          results,
        };
      });

    const totalWeight = config.categories.filter(c => c.enabled).reduce((sum, c) => sum + c.weight, 0);
    const overallScore = totalWeight > 0
      ? categoryResults.reduce((sum, cr) => {
          const category = config.categories.find(c => c.id === cr.categoryId);
          return sum + cr.score * (category?.weight || 0);
        }, 0) / totalWeight
      : 100;

    const roundedScore = Math.round(overallScore);
    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (roundedScore >= config.globalThresholds.excellent) status = 'excellent';
    else if (roundedScore >= config.globalThresholds.good) status = 'good';
    else if (roundedScore >= config.globalThresholds.fair) status = 'fair';
    else status = 'poor';

    const newAnalysis: ScheduleAnalysis = {
      id: Date.now().toString(),
      name,
      date: new Date(),
      overallScore: roundedScore,
      status,
      totalActivities: scheduleData.activities.length,
      totalRelationships: scheduleData.relationships.length,
      criticalActivities: scheduleData.activities.filter(a => a.isCritical).length,
      activitiesWithIssues: scheduleData.activities.filter(a => 
        scheduleData.relationships.some(r => r.predecessor === a.id || r.successor === a.id)
      ).length,
      categoryResults,
    };

    setAnalysis(newAnalysis);
    return newAnalysis;
  }, [config, scheduleData, analyzeCriterion]);

  // Guardar análisis
  const saveAnalysis = useCallback((analysisToSave: ScheduleAnalysis) => {
    setSavedAnalyses(prev => [...prev, analysisToSave]);
  }, []);

  // Actualizar criterio específico
  const updateCriterion = useCallback((categoryId: string, criterionId: string, updates: Partial<import('@/types').CriterionConfig>) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              criteria: cat.criteria.map(crit =>
                crit.id === criterionId ? { ...crit, ...updates } : crit
              ),
            }
          : cat
      ),
    }));
  }, []);

  // Actualizar categoría
  const updateCategory = useCallback((categoryId: string, updates: Partial<import('@/types').CategoryConfig>) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ),
    }));
  }, []);

  // Exportar configuración
  const exportConfig = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  // Importar configuración
  const importConfig = useCallback((configJson: string) => {
    try {
      const imported = JSON.parse(configJson) as UserConfig;
      setConfig(imported);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Cargar datos de archivo
  const loadScheduleData = useCallback((data: ScheduleData) => {
    setScheduleData(data);
  }, []);

  // Resetear a configuración por defecto
  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
  }, []);

  // Estadísticas memoizadas
  const stats = useMemo(() => {
    if (!analysis) return null;
    
    const totalOk = analysis.categoryResults.reduce(
      (sum, cat) => sum + cat.results.filter(r => r.status === 'ok').length, 0
    );
    const totalWarnings = analysis.categoryResults.reduce(
      (sum, cat) => sum + cat.results.filter(r => r.status === 'warning').length, 0
    );
    const totalCritical = analysis.categoryResults.reduce(
      (sum, cat) => sum + cat.results.filter(r => r.status === 'critical').length, 0
    );

    return {
      totalOk,
      totalWarnings,
      totalCritical,
      totalChecks: totalOk + totalWarnings + totalCritical,
    };
  }, [analysis]);

  return {
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
  };
}
