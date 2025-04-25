const fs = require('fs');
const path = require('path');

// Load the disease data
const filePath = path.join(__dirname, 'src/assets/data/disease-cattle.json');
const diseaseData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Create a mapping of disease names to their vaccinations
const vaccinationMap = {
  "Anthrax": ["Anthrax vaccine"],
  "Blackleg": ["Blackleg vaccine", "7-way Clostridial vaccine", "8-way Clostridial vaccine"],
  "Infectious Bovine Rhinotracheitis": ["IBR vaccine", "BRD vaccine (5-way)", "3-way vaccine (IBR, BVD, PI3)"],
  "Bovine Viral Diarrhea": ["BVD vaccine", "BRD vaccine (5-way)", "3-way vaccine (IBR, BVD, PI3)"],
  "Bovine Respiratory Syncytial Virus": ["BRSV vaccine", "BRD vaccine (5-way)"],
  "Bovine Pasteurellosis": ["Mannheimia haemolytica vaccine", "Pasteurella multocida vaccine", "BRD vaccine (5-way)"],
  "Parainfluenza-3": ["PI3 vaccine", "BRD vaccine (5-way)", "3-way vaccine (IBR, BVD, PI3)"],
  "Leptospirosis": ["Leptospirosis vaccine", "5-way Lepto vaccine"],
  "Brucellosis": ["Brucellosis vaccine (RB51)", "Brucellosis vaccine (Strain 19)"],
  "Rotaviral Diarrhea": ["Rotavirus/Coronavirus vaccine", "Scours vaccine"],
  "Coronaviral Diarrhea": ["Rotavirus/Coronavirus vaccine", "Scours vaccine"],
  "Escherichia coli Diarrhea": ["E. coli vaccine", "Scours vaccine"],
  "Foot and Mouth Disease": ["Foot and Mouth Disease vaccine"],
  "Rabies": ["Rabies vaccine"],
  "Clostridial Diseases": ["7-way Clostridial vaccine", "8-way Clostridial vaccine"],
  "Botulism": ["Botulism vaccine", "7-way Clostridial vaccine"],
  "Bovine Campylobacteriosis": ["Campylobacteriosis vaccine", "Vibriosis vaccine"]
};

// Update the diseases with vaccination information
diseaseData.cattle_diseases.forEach(disease => {
  // Look for exact matches
  if (vaccinationMap[disease.disease_name]) {
    disease.vaccinations = vaccinationMap[disease.disease_name];
  } else {
    // Look for partial matches
    for (const [diseaseName, vaccines] of Object.entries(vaccinationMap)) {
      if (disease.disease_name.includes(diseaseName) || 
          (disease.alternative_names && disease.alternative_names.includes(diseaseName))) {
        disease.vaccinations = vaccines;
        break;
      }
    }
    
    // For diseases without specific vaccines, set empty array or undefined
    if (!disease.vaccinations) {
      disease.vaccinations = [];
    }
  }
});

// Write the updated data back to the file
fs.writeFileSync(filePath, JSON.stringify(diseaseData, null, 2));
console.log('Updated disease-cattle.json with vaccination information');