import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface DiseaseData {
  disease_name: string;
  disease_id: string;
  alternative_names: string;
  category: string;
  causative_agents: string;
  symptoms: string[] | { [key: string]: string[] };
  transmission: string;
  diagnosis_methods: string;
  treatments: string[];
  healing_process: string[];
  prevention: string[];
  prognosis: string;
  zoonotic_potential?: string;
  vaccinations?: string[]; // Available vaccines that prevent this disease
}

export interface DiagnosticResult {
  disease: DiseaseData;
  score: number;
  matchedSymptoms: string[];
  unmatchedSymptoms: string[];
  confidence: number;
  differentialSymptoms?: string[]; // Symptoms that help differentiate this disease from others
}

export interface DiagnosticParams {
  symptoms: string[];
  animalInfo?: {
    age?: number;
    weight?: number;
    vaccinations?: string[]; // Added vaccinations array
    gender?: 'male' | 'female';
    lactating?: boolean;
    pregnant?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DiseaseDiagnosticService {
  private diseaseDataset: DiseaseData[] = [];
  private dataLoaded = false;

  constructor(private http: HttpClient) {
    this.loadDiseaseData();
  }

  /**
   * Loads disease data from the JSON file
   */
  loadDiseaseData(): Observable<DiseaseData[]> {
    if (this.dataLoaded) {
      return of(this.diseaseDataset);
    }
    
    return this.http.get<{cattle_diseases: DiseaseData[]}>('assets/data/disease-cattle.json')
      .pipe(
        map(data => {
          this.diseaseDataset = data.cattle_diseases;
          this.dataLoaded = true;
          return this.diseaseDataset;
        }),
        catchError(error => {
          console.error('Error loading disease data:', error);
          return of([]);
        })
      );
  }

  /**
   * Normalises a symptom string for better matching
   * Removes punctuation, converts to lowercase, and simplifies common terms
   */
  private normaliseSymptom(symptom: string): string {
    return symptom
      .toLowerCase()
      // Replace parentheses and their contents with empty space
      .replace(/\([^)]*\)/g, ' ')
      // Replace forward slash with space to handle "term1/term2" better
      .replace(/\//g, ' ')
      // Remove remaining punctuation
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      // Replace multiple spaces with single space
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Extracts all symptoms from a disease object and flattens them into a single array
   */
  private extractAllSymptoms(disease: DiseaseData): string[] {
    if (Array.isArray(disease.symptoms)) {
      return disease.symptoms;
    } else {
      // Handle structure where symptoms are organised by animal type
      const symptomArrays = Object.values(disease.symptoms as { [key: string]: string[] });
      // Manual flatten implementation instead of using .flat() for compatibility
      return symptomArrays.reduce((acc, val) => acc.concat(val), []);
    }
  }

  /**
   * Calculates how well a symptom matches with disease symptoms
   * Returns a score between 0-1
   * Enhanced for standardised symptoms
   */
  private calculateSymptomMatch(userSymptom: string, diseaseSymptom: string): number {
    const normalisedUserSymptom = this.normaliseSymptom(userSymptom);
    const normalisedDiseaseSymptom = this.normaliseSymptom(diseaseSymptom);
    
    // Exact match (higher weight for standardised symptoms)
    if (normalisedUserSymptom === normalisedDiseaseSymptom) {
      return 1;
    }
    
    // Strong partial match for standardised terms
    // This checks if one contains the whole other term
    if (normalisedDiseaseSymptom.includes(normalisedUserSymptom) || 
        normalisedUserSymptom.includes(normalisedDiseaseSymptom)) {
      return 0.9; // Increased from 0.8 for better standardised matching
    }
    
    // Key term match - for standard medical terminology 
    const keyTerms = [
      'fever', 'discharge', 'lesions', 'weakness', 'lameness', 
      'swelling', 'abortion', 'diarrhoea', 'pain', 'jaundice',
      'anaemia', 'tremors', 'seizures', 'death', 'oedema',
      'neurological', 'lymph', 'ulcers', 'opacity', 'recumbency'
    ];
    
    // Check if both descriptions share key medical terms
    const userHasKeyTerms = keyTerms.filter(term => normalisedUserSymptom.includes(term));
    const diseaseHasKeyTerms = keyTerms.filter(term => normalisedDiseaseSymptom.includes(term));
    
    // Common key terms
    const commonKeyTerms = userHasKeyTerms.filter(term => diseaseHasKeyTerms.includes(term));
    if (commonKeyTerms.length > 0) {
      return 0.85 * (commonKeyTerms.length / Math.max(userHasKeyTerms.length, 1));
    }
    
    // Word overlap match - more weight for medically relevant terms
    const userWords = normalisedUserSymptom.split(' ').filter((w: string) => w.length > 3);
    const diseaseWords = normalisedDiseaseSymptom.split(' ').filter((w: string) => w.length > 3);
    
    const matchingWords = userWords.filter((word: string) => 
      diseaseWords.some((dWord: string) => dWord.includes(word) || word.includes(dWord))
    );
    
    if (matchingWords.length > 0) {
      return 0.7 * (matchingWords.length / Math.max(userWords.length, 1));
    }
    
    return 0;
  }

  /**
   * Adjusts disease score based on animal information
   * Enhanced for standardised symptom format
   */
  private adjustScoreByAnimalInfo(disease: DiseaseData, score: number, animalInfo?: DiagnosticParams['animalInfo']): number {
    if (!animalInfo) return score;
    
    let adjustedScore = score;
    
    // Define disease categories for different animal demographics
    const calfDiseases = [
      'Coccidiosis', 'Cryptosporidiosis', 'Bovine Respiratory Syncytial Virus', 
      'Bovine Viral Diarrhea', 'Bovine Parainfluenza-3'
    ];
    
    const adultDiseases = [
      'Hypocalcemia', 'Mastitis', 'Abomasal Displacement', 'Bovine Tuberculosis',
      'Johne\'s Disease', 'Bovine Spongiform Encephalopathy'
    ];
    
    const femaleDiseases = [
      'Mastitis', 'Hypocalcemia', 'Bovine Campylobacteriosis', 'Bovine Trichomoniasis'
    ];
    
    const maleDiseases = [
      'Bovine Campylobacteriosis', 'Bovine Trichomoniasis'
    ];
    
    const reproductiveDiseases = [
      'Neosporosis', 'Bovine Trichomoniasis', 'Bovine Campylobacteriosis', 
      'Leptospirosis', 'Bovine Viral Diarrhea', 'Infectious Bovine Rhinotracheitis'
    ];
    
    // Vaccination status adjustment
    if (animalInfo.vaccinations && animalInfo.vaccinations.length > 0 && disease.vaccinations && disease.vaccinations.length > 0) {
      // For each vaccination the animal has received
      animalInfo.vaccinations.forEach(vaccination => {
        // Normalize the vaccination name for better matching
        const normalizedVaccination = this.normaliseSymptom(vaccination);
        
        // Check if this vaccination covers the current disease
        const vaccinationMatch = disease.vaccinations.some(diseaseVaccine => {
          const normalizedDiseaseVaccine = this.normaliseSymptom(diseaseVaccine);
          // Check for direct matches or if the vaccine is mentioned in the disease vaccine
          return normalizedDiseaseVaccine.includes(normalizedVaccination) || 
                 normalizedVaccination.includes(normalizedDiseaseVaccine);
        });
        
        // If the animal is vaccinated against this disease, significantly reduce the score
        if (vaccinationMatch) {
          adjustedScore *= 0.25; // 75% reduction for diseases the animal is vaccinated against
        }
      });
    }
    
    // Age-based adjustments
    if (animalInfo.age !== undefined) {
      // Young animals (calves)
      if (animalInfo.age < 1) {
        if (calfDiseases.some(d => disease.disease_name.includes(d))) {
          adjustedScore *= 1.35; // Increased multiplier for calf diseases
        }
      } 
      // Adult animals
      else if (animalInfo.age > 3) {
        if (adultDiseases.some(d => disease.disease_name.includes(d))) {
          adjustedScore *= 1.25; // Increased multiplier for adult diseases
        }
      }
    }
    
    // Check for specific symptoms in disease symptom list
    const diseaseSymptoms = this.extractAllSymptoms(disease);
    const normalisedSymptoms = diseaseSymptoms.map((s: string) => this.normaliseSymptom(s));
    
    // Gender and reproductive status adjustments
    if (animalInfo.gender === 'female') {
      // Check for female-specific diseases
      if (femaleDiseases.some(d => disease.disease_name.includes(d))) {
        adjustedScore *= 1.3;
      }
      
      // Additional adjustment for lactating cows
      if (animalInfo.lactating) {
        // Look for lactation-related symptoms
        if (normalisedSymptoms.some((s: string) => 
          s.includes('milk production') || 
          s.includes('mastitis') || 
          s.includes('udder') ||
          s.includes('teat'))) {
          adjustedScore *= 1.4; // Significant boost for lactating-specific issues
        }
      }
      
      // Pregnancy-related adjustments
      if (animalInfo.pregnant) {
        // Check for reproductive diseases
        if (reproductiveDiseases.some(d => disease.disease_name.includes(d)) || 
            disease.category?.includes('Reproductive')) {
          adjustedScore *= 1.35;
        }
        
        // Look for pregnancy-related symptoms
        if (normalisedSymptoms.some((s: string) => 
          s.includes('abortion') || 
          s.includes('stillbirth') || 
          s.includes('fetus') ||
          s.includes('pregnant') ||
          s.includes('gestation'))) {
          adjustedScore *= 1.45; // Significant boost for pregnancy symptoms
        }
      }
    }
    
    // Male-specific adjustments
    if (animalInfo.gender === 'male') {
      // Check for male-specific diseases or symptoms
      if (maleDiseases.some(d => disease.disease_name.includes(d))) {
        adjustedScore *= 1.3;
      }
      
      // Check if symptoms mention bulls specifically
      if (disease.symptoms && 
          typeof disease.symptoms === 'object' && 
          'bulls' in disease.symptoms) {
        adjustedScore *= 1.35;
      }
      
      // Reduce score for strictly female issues
      if (normalisedSymptoms.some((s: string) => 
        s.includes('mastitis') || 
        s.includes('milk fever') ||
        s.includes('udder') ||
        s.includes('milk production'))) {
        adjustedScore *= 0.15; // Stronger reduction for female-specific symptoms
      }
    }
    
    return adjustedScore;
  }

  /**
   * Main diagnostic function that takes symptoms and returns potential matches
   * Enhanced for standardised symptom format
   */
  diagnoseDiseases(params: DiagnosticParams): Observable<DiagnosticResult[]> {
    return this.loadDiseaseData().pipe(
      map(diseases => {
        if (!diseases || diseases.length === 0) {
          return [];
        }

        const results: DiagnosticResult[] = [];
        
        // For each disease, calculate a match score
        diseases.forEach(disease => {
          const diseaseSymptoms = this.extractAllSymptoms(disease);
          const matchedSymptoms: string[] = [];
          let totalScore = 0;
          
          // Track which user symptoms were matched and which weren't
          const unmatchedSymptoms: string[] = [];

          // For each user symptom, find the best match in disease symptoms
          params.symptoms.forEach(userSymptom => {
            let bestMatch = { score: 0, symptom: '', userSymptom: userSymptom };
            
            diseaseSymptoms.forEach(diseaseSymptom => {
              const matchScore = this.calculateSymptomMatch(userSymptom, diseaseSymptom);
              if (matchScore > bestMatch.score) {
                bestMatch = { score: matchScore, symptom: diseaseSymptom, userSymptom: userSymptom };
              }
            });
            
            if (bestMatch.score > 0) {
              totalScore += bestMatch.score;
              // Use a lower threshold for including matched symptoms since we have better matching
              if (bestMatch.score >= 0.5) {
                matchedSymptoms.push(bestMatch.symptom);
              } else {
                // If the match is poor, consider it unmatched
                unmatchedSymptoms.push(bestMatch.userSymptom);
              }
            } else {
              // If no match at all, add to unmatched
              unmatchedSymptoms.push(bestMatch.userSymptom);
            }
          });
          
          // Calculate raw score as average match per symptom
          let score = totalScore / params.symptoms.length;
          
          // Adjust score based on animal information
          score = this.adjustScoreByAnimalInfo(disease, score, params.animalInfo);
          
          // Adjust score based on number of matched symptoms - more weight on match ratio
          // with standardised symptoms
          const matchRatio = matchedSymptoms.length / params.symptoms.length;
          score = score * (0.4 + 0.6 * matchRatio); // More weight on having multiple symptom matches
          
          // Boost score if disease has exactly the symptoms user described (perfect matches)
          const perfectMatches = matchedSymptoms.filter(s => {
            // Find matching user symptom with high confidence
            return params.symptoms.some(userS => 
              this.calculateSymptomMatch(userS, s) > 0.9
            );
          });
          
          if (perfectMatches.length > 0) {
            const perfectMatchRatio = perfectMatches.length / params.symptoms.length;
            score *= (1 + perfectMatchRatio * 0.25); // Up to 25% boost for perfect matches
          }
          
          // Only include diseases with at least one good symptom match
          if (matchedSymptoms.length > 0) {
            results.push({
              disease,
              score,
              matchedSymptoms,
              unmatchedSymptoms,
              confidence: Math.min(score * 100, 99) // Convert to percentage, cap at 99%
            });
          }
        });
        
        // Sort results by score, highest first
        const sortedResults = results
          .sort((a, b) => b.score - a.score)
          .slice(0, 5); // Return top 5 matches
        
        // Identify diseases with similar confidence scores for differential diagnosis
        this.addDifferentialDiagnosisInfo(sortedResults, params.symptoms);
        
        return sortedResults;
      })
    );
  }

  /**
   * Add differential diagnosis information to the results
   * This helps differentiate between diseases with similar symptoms
   */
  private addDifferentialDiagnosisInfo(results: DiagnosticResult[], userSymptoms: string[]): void { // Method name unchanged to maintain functionality
    if (results.length <= 1) return; // No need for differential if only one disease
    
    // Check if we have diseases with similar confidence scores
    const topConfidence = results[0].confidence;
    const similarConfidenceDiseases = results.filter(result => 
      (topConfidence - result.confidence) < 10 // Consider diseases within 10% confidence as similar
    );
    
    if (similarConfidenceDiseases.length <= 1) return; // No similar confidence diseases
    
    // For each disease with similar confidence, find differentiating symptoms
    similarConfidenceDiseases.forEach(result => {
      const disease = result.disease;
      const allDiseaseSymptoms = this.extractAllSymptoms(disease);
      const differentialSymptoms: string[] = [];
      
      // Find distinctive symptoms for this disease
      allDiseaseSymptoms.forEach(symptom => {
        // Check if this symptom is distinctive (not common in other similar diseases)
        let isDistinctive = true;
        
        for (const otherResult of similarConfidenceDiseases) {
          if (otherResult === result) continue; // Skip comparing with itself
          
          const otherDiseaseSymptoms = this.extractAllSymptoms(otherResult.disease);
          
          // Check if other disease has a similar symptom
          for (const otherSymptom of otherDiseaseSymptoms) {
            if (this.calculateSymptomMatch(symptom, otherSymptom) > 0.7) {
              isDistinctive = false;
              break;
            }
          }
          
          if (!isDistinctive) break;
        }
        
        // If this symptom is distinctive AND not already observed, add it to differentiating symptoms
        if (isDistinctive && !userSymptoms.some(userSymptom => 
            this.calculateSymptomMatch(userSymptom, symptom) >= 0.7)) {
          // Only add if it's not too similar to symptoms already in the array
          if (!differentialSymptoms.some(diffSymptom => 
              this.calculateSymptomMatch(diffSymptom, symptom) >= 0.8)) {
            differentialSymptoms.push(symptom);
          }
        }
      });
      
      // Store top 3 most specific/useful differential symptoms
      result.differentialSymptoms = differentialSymptoms
        .slice(0, 3)
        .filter(s => s && s.length > 0); // Ensure non-empty symptoms
    });
  }

  /**
   * Provides information about a specific disease by ID
   */
  getDiseaseById(diseaseId: string): Observable<DiseaseData | undefined> {
    return this.loadDiseaseData().pipe(
      map(diseases => diseases.find(d => d.disease_id === diseaseId))
    );
  }
}