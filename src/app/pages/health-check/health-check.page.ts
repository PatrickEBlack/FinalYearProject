import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
// HttpClient is provided in main.ts, don't need to import module here
import { DiseaseDiagnosticService, DiagnosticResult } from '../../services/disease-diagnostic.service';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonChip,
  IonRadioGroup,
  IonRadio,
  IonAccordionGroup,
  IonAccordion,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonProgressBar,
  IonModal,
  IonFab,
  IonFabButton,
  IonAlert
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  eyeOutline,
  addOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  warningOutline,
  arrowBackOutline,
  createOutline,
  searchOutline,
  closeOutline,
  medicalOutline,
  helpCircleOutline,
  informationCircleOutline,
  documentsOutline,
  checkmarkCircle,
  alertCircle,
  searchCircle
} from 'ionicons/icons';

@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.page.html',
  styleUrls: ['./health-check.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    TitleCasePipe,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonChip,
    IonRadioGroup,
    IonRadio,
    IonAccordionGroup,
    IonAccordion,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonProgressBar,
    IonModal,
    IonFab,
    IonFabButton,
    IonAlert
  ]
})
export class HealthCheckPage implements OnInit {
  // Diagnostic form
  diagnosticForm!: FormGroup; // Use the definite assignment assertion
  showDiagnosticTool: boolean = true; // Show form by default
  
  // Results
  diagnosticResults: DiagnosticResult[] = [];
  isLoading: boolean = false;
  
  // Helper methods for template type safety
  isSymptomArray(symptoms: string[] | { [key: string]: string[] }): boolean {
    return Array.isArray(symptoms);
  }
  
  getSymptomArray(symptoms: string[] | { [key: string]: string[] }): string[] {
    return Array.isArray(symptoms) ? symptoms : [];
  }
  
  getSymptomsByKey(symptoms: string[] | { [key: string]: string[] }, key: string): string[] {
    if (!Array.isArray(symptoms) && symptoms && symptoms[key]) {
      return symptoms[key];
    }
    return [];
  }
  
  // Method to get object keys safely
  getObjectKeys(obj: any): string[] {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return Object.keys(obj);
    }
    return [];
  }
  
  // Common standardised symptoms array - sorted alphabetically
  commonSymptoms: string[] = [
    'Abdominal pain/discomfort',
    'Abortion',
    'Anaemia',
    'Breathing difficulties',
    'Corneal opacity (blue eye)',
    'Coughing',
    'Dehydration',
    'Depression and lethargy',
    'Diarrhoea',
    'Enlarged lymph nodes',
    'Excessive drooling/salivation',
    'Eye discharge/tearing',
    'High fever',
    'Inability to rise/stand (recumbency)',
    'Jaundice (yellow mucous membranes)',
    'Lameness',
    'Muscle tremors/twitching',
    'Nasal discharge',
    'Neurological signs',
    'Reduced appetite/feed intake',
    'Reduced growth rate',
    'Reduced milk production',
    'Seizures/convulsions',
    'Skin lesions/nodules',
    'Stiffness',
    'Swelling/oedema',
    'Weakness',
    'Weight loss'
  ];
  
  customSymptom: string = '';
  symptomFilter: string = '';
  selectedDiseaseDetails: DiagnosticResult | null = null;
  
  // Filter symptoms based on search input
  getFilteredSymptoms(): string[] {
    if (!this.symptomFilter || this.symptomFilter.trim() === '') {
      return this.commonSymptoms;
    }
    
    const filter = this.symptomFilter.toLowerCase().trim();
    return this.commonSymptoms.filter(symptom => 
      symptom.toLowerCase().includes(filter)
    );
  }

  constructor(
    private fb: FormBuilder,
    private diagnosticService: DiseaseDiagnosticService
  ) {
    // Register the Ionicons
    addIcons({
      'add-circle-outline': addCircleOutline,
      'eye-outline': eyeOutline,
      'add-outline': addOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'alert-circle-outline': alertCircleOutline,
      'warning-outline': warningOutline,
      'arrow-back-outline': arrowBackOutline,
      'create-outline': createOutline,
      'search-outline': searchOutline,
      'close-outline': closeOutline,
      'medical-outline': medicalOutline,
      'help-circle-outline': helpCircleOutline,
      'information-circle-outline': informationCircleOutline,
      'documents-outline': documentsOutline,
      'checkmark-circle': checkmarkCircle,
      'alert-circle': alertCircle,
      'search-circle': searchCircle
    });
  }

  ngOnInit() {
    // Initialize the diagnostic form
    this.diagnosticForm = this.fb.group({
      symptoms: this.fb.array([]),
      animalInfo: this.fb.group({
        age: [null],
        weight: [null],
        breed: [''],
        gender: [''],
        lactating: [false],
        pregnant: [false]
      })
    });
    
    // Default to showing the tool for better UX
    this.showDiagnosticTool = true;
  }
  
  // Toggle the diagnostic tool visibility
  toggleDiagnosticTool() {
    this.showDiagnosticTool = !this.showDiagnosticTool;
    if (!this.showDiagnosticTool) {
      this.resetDiagnosticForm();
    }
  }
  
  // Get the symptoms form array
  get symptoms(): FormArray {
    return this.diagnosticForm.get('symptoms') as FormArray;
  }
  
  // Add a symptom to the form
  addSymptom(symptom: string) {
    // Don't add if already in the list
    const existing = this.symptoms.value.find((s: string) => s.toLowerCase() === symptom.toLowerCase());
    if (existing) return;
    
    // Add to form array
    this.symptoms.push(this.fb.control(symptom));
    
    // Clear custom input if adding a custom symptom
    if (symptom === this.customSymptom) {
      this.customSymptom = '';
    }
  }
  
  // Remove a symptom from the form
  removeSymptom(index: number) {
    this.symptoms.removeAt(index);
  }
  
  // Add custom symptom
  addCustomSymptom() {
    if (this.customSymptom.trim()) {
      this.addSymptom(this.customSymptom.trim());
    }
  }
  
  // Check if a symptom is already selected
  isSymptomSelected(symptom: string): boolean {
    if (!this.symptoms) return false;
    return this.symptoms.value.some((s: string) => 
      s.toLowerCase() === symptom.toLowerCase()
    );
  }
  
  // Clear all form data
  resetDiagnosticForm() {
    this.diagnosticForm.reset();
    while (this.symptoms.length > 0) {
      this.symptoms.removeAt(0);
    }
    this.diagnosticResults = [];
    this.selectedDiseaseDetails = null;
  }
  
  // Run the diagnostic algorithm
  runDiagnostic() {
    if (this.symptoms.length === 0) {
      // Show alert that symptoms are required
      return;
    }
    
    this.isLoading = true;
    
    // Get the form values
    const diagParams = {
      symptoms: this.symptoms.value,
      animalInfo: this.diagnosticForm.get('animalInfo')?.value
    };
    
    // Call the diagnostic service
    this.diagnosticService.diagnoseDiseases(diagParams).subscribe(
      results => {
        this.diagnosticResults = results;
        this.isLoading = false;
      },
      error => {
        console.error('Error in diagnosis:', error);
        this.isLoading = false;
      }
    );
  }
  
  // View details of a specific disease
  viewDiseaseDetails(result: DiagnosticResult) {
    this.selectedDiseaseDetails = result;
  }
  
  // Close disease details view
  closeDetails() {
    this.selectedDiseaseDetails = null;
  }
  
  // Get confidence level class
  getConfidenceClass(confidence: number): string {
    if (confidence >= 75) return 'high-confidence';
    if (confidence >= 50) return 'medium-confidence';
    return 'low-confidence';
  }
}