
"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, MinusCircle, RefreshCw, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

interface Grade {
  id: number;
  score: string;
  weight: string;
}

export function GradeCalculator() {
  const nextId = useRef(1);
  const [grades, setGrades] = useState<Grade[]>([{ id: 0, score: '', weight: '' }]);
  const [targetGrade, setTargetGrade] = useState<string>('3.0');

  useEffect(() => {
    try {
      const savedGrades = localStorage.getItem('gradeWiseGrades');
      if (savedGrades) {
        const parsedGrades = JSON.parse(savedGrades);
        if (Array.isArray(parsedGrades) && parsedGrades.length > 0) {
          setGrades(parsedGrades);
          const maxId = Math.max(...parsedGrades.map((g: Grade) => g.id), 0);
          nextId.current = maxId + 1;
        }
      }
      const savedTargetGrade = localStorage.getItem('gradeWiseTargetGrade');
      if (savedTargetGrade) {
        setTargetGrade(JSON.parse(savedTargetGrade));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('gradeWiseGrades', JSON.stringify(grades));
      localStorage.setItem('gradeWiseTargetGrade', JSON.stringify(targetGrade));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [grades, targetGrade]);

  const handleAddGrade = () => {
    setGrades([...grades, { id: nextId.current++, score: '', weight: '' }]);
  };

  const handleRemoveGrade = (id: number) => {
    if (grades.length > 1) {
      setGrades(grades.filter(grade => grade.id !== id));
    }
  };
  
  const handleGradeChange = (id: number, field: 'score' | 'weight', value: string) => {
    const newGrades = grades.map(grade => grade.id === id ? { ...grade, [field]: value } : grade);
    setGrades(newGrades);
  };
  
  const handleReset = () => {
    setGrades([{ id: 0, score: '', weight: '' }]);
    setTargetGrade('3.0');
    nextId.current = 1;
  };

  const results = useMemo(() => {
    let totalWeight = 0;
    let weightedSum = 0;
    let hasInvalidInput = false;

    for (const grade of grades) {
      const score = parseFloat(grade.score);
      const weight = parseFloat(grade.weight);

      if (grade.score && (isNaN(score) || score < 0 || score > 5)) {
        hasInvalidInput = true;
        break;
      }
      if (grade.weight && (isNaN(weight) || weight < 0 || weight > 100)) {
        hasInvalidInput = true;
        break;
      }
      
      if (!isNaN(score) && !isNaN(weight)) {
        totalWeight += weight;
        weightedSum += score * (weight / 100);
      }
    }

    if (hasInvalidInput) {
      return { error: 'Entrada inválida. Las notas deben estar entre 0 y 5, y los porcentajes entre 0 y 100.' };
    }
    
    if (totalWeight > 100) {
      return { error: `El porcentaje total (${totalWeight.toFixed(0)}%) no puede superar el 100%.` };
    }

    const absoluteGrade = weightedSum;
    const relativeGrade = totalWeight > 0 ? (weightedSum / (totalWeight / 100)) : 0;
    
    const target = parseFloat(targetGrade);
    let neededGradeInfo = '¡Felicidades! Ya alcanzó la nota mínima.';
    
    if (isNaN(target) || target < 0 || target > 5) {
        neededGradeInfo = 'La nota mínima para aprobar debe estar entre 0 y 5.';
    } else {
        const remainingWeight = 100 - totalWeight;
        if (remainingWeight > 0) {
            const neededGrade = (target - absoluteGrade) / (remainingWeight / 100);
            if (neededGrade > 5.01) { 
              neededGradeInfo = `Necesita ${neededGrade.toFixed(2)}. No es posible alcanzar la nota.`;
            } else if (neededGrade <= 0) {
              neededGradeInfo = '¡Felicidades! Ya alcanzó la nota mínima.';
            } else {
              neededGradeInfo = `Necesita un ${neededGrade.toFixed(2)} en el ${remainingWeight.toFixed(0)}% restante.`;
            }
        }
    }

    const getResultColor = (grade: number) => {
        if (grade >= 4) return 'text-chart-2';
        if (grade >= 3) return 'text-chart-4';
        return 'text-destructive';
    };
  
    const getNeededGradeColor = (info: string) => {
        if (info.includes('No es posible') || info.includes('debe estar')) return 'text-destructive';
        if (info.includes('Ya alcanzó')) return 'text-chart-2';
        return 'text-chart-4';
    };

    return {
      absoluteGrade,
      relativeGrade,
      totalWeight,
      neededGradeInfo,
      resultColor: getResultColor,
      neededColor: getNeededGradeColor(neededGradeInfo),
      error: null
    };
  }, [grades, targetGrade]);
  
  return (
    <Card className="w-full max-w-2xl shadow-2xl animate-fade-in">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center font-headline tracking-tight">GradeWise</CardTitle>
        <CardDescription className="text-center">
          Calcule sus notas y planifique su éxito académico.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
            <Label htmlFor="target-grade" className="font-semibold text-base">Nota mínima para aprobar</Label>
            <Input 
                id="target-grade"
                type="number"
                placeholder="Ej: 3.0"
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                min="0"
                max="5"
                step="0.1"
                className="mt-2 max-w-xs text-lg"
            />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-semibold">Notas y Porcentajes</h3>
             <Button variant="outline" size="sm" onClick={handleAddGrade}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Nota
            </Button>
          </div>
          <div id="notas" className="space-y-4 max-h-[24rem] overflow-y-auto p-1 -m-1">
            {grades.map((grade, index) => (
                <div key={grade.id} className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-3 border rounded-lg bg-background hover:border-primary/20 transition-colors">
                    <div className="grid gap-1.5 w-full sm:flex-1">
                        <Label htmlFor={`score-${grade.id}`}>Nota {index + 1}</Label>
                        <Input
                            id={`score-${grade.id}`}
                            type="number"
                            placeholder="4.5"
                            value={grade.score}
                            onChange={(e) => handleGradeChange(grade.id, 'score', e.target.value)}
                            min="0"
                            max="5"
                            step="0.1"
                        />
                    </div>
                    <div className="grid gap-1.5 w-full sm:flex-1">
                        <Label htmlFor={`weight-${grade.id}`}>Porcentaje</Label>
                        <div className="relative flex items-center">
                            <Input
                                id={`weight-${grade.id}`}
                                type="number"
                                placeholder="25"
                                value={grade.weight}
                                onChange={(e) => handleGradeChange(grade.id, 'weight', e.target.value)}
                                min="0"
                                max="100"
                                className="pr-6"
                            />
                            <span className="absolute right-3 text-sm text-muted-foreground pointer-events-none">%</span>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveGrade(grade.id)} 
                        disabled={grades.length <= 1}
                        aria-label={`Eliminar nota ${index + 1}`}
                        className="text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed shrink-0 sm:ml-auto"
                    >
                        <MinusCircle className="h-5 w-5" />
                    </Button>
                </div>
            ))}
          </div>
        </div>

        {results && (
          <div className="space-y-4">
            <Separator />
            {results.error ? (
              <div className="p-4 bg-destructive/10 rounded-lg text-center text-destructive font-medium">
                  {results.error}
              </div>
            ) : (
              <div className="p-4 border bg-muted/30 rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-center">Resultados</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-background/50 rounded-md">
                          <p className="text-sm text-muted-foreground">Nota Absoluta</p>
                          <p className={cn("text-3xl font-bold", results.resultColor(results.absoluteGrade))}>{results.absoluteGrade.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-background/50 rounded-md">
                          <p className="text-sm text-muted-foreground">Nota Parcial</p>
                          <p className={cn("text-3xl font-bold", results.resultColor(results.relativeGrade))}>{results.relativeGrade.toFixed(2)}</p>
                      </div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-md">
                      <p className="text-sm text-muted-foreground">Para alcanzar tu meta</p>
                      <p className={cn("text-lg font-semibold", results.neededColor)}>{results.neededGradeInfo}</p>
                  </div>
                  <div className="text-center text-sm text-muted-foreground pt-2 space-y-2">
                      <p>Progreso del curso: <strong>{results.totalWeight.toFixed(0)}%</strong></p>
                      <Progress value={results.totalWeight} className="h-2 w-full" />
                  </div>
              </div>
            )}
          </div>
        )}

      </CardContent>
      <CardFooter className="flex-col gap-4 pt-6">
         <Button onClick={handleReset} variant="secondary" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reiniciar Calculadora
        </Button>
        <div className="w-full border rounded-lg">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="glossary" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline">
                  <div className="flex items-center gap-2 text-card-foreground">
                      <BookOpen className="h-4 w-4"/>
                      Glosario de Notas
                  </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 text-xs text-muted-foreground space-y-2">
                  <p><strong>Nota Parcial (Relativa):</strong> Tu promedio basado en lo que has completado hasta ahora.</p>
                  <p><strong>Nota Absoluta (Final):</strong> Tu nota proyectada sobre el 100% del curso.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardFooter>
    </Card>
  );
}

export default GradeCalculator;

    