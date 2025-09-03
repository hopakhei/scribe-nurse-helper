interface FieldValues {
  [key: string]: any;
}

export function computeMews(fieldValues: FieldValues): number | null {
  let score = 0;
  let hasAnyInput = false;

  // Systolic BP scoring
  const systolic = Number(fieldValues.systolic_bp);
  if (systolic > 0) {
    hasAnyInput = true;
    if (systolic <= 70) score += 3;
    else if (systolic >= 71 && systolic <= 80) score += 2;
    else if (systolic >= 81 && systolic <= 100) score += 1;
    else if (systolic >= 101 && systolic <= 199) score += 0;
    else if (systolic >= 200) score += 3;
  }

  // Heart/Pulse Rate scoring
  const pulse = Number(fieldValues.pulse);
  if (pulse > 0) {
    hasAnyInput = true;
    if (pulse <= 40) score += 3;
    else if (pulse >= 41 && pulse <= 50) score += 2;
    else if (pulse >= 51 && pulse <= 100) score += 0;
    else if (pulse >= 101 && pulse <= 110) score += 0;
    else if (pulse >= 111 && pulse <= 129) score += 1;
    else if (pulse >= 130) score += 3;
  }

  // Respiratory Rate scoring
  const respiratoryRate = Number(fieldValues.respiratory_rate);
  if (respiratoryRate > 0) {
    hasAnyInput = true;
    if (respiratoryRate <= 8) score += 3;
    else if (respiratoryRate >= 9 && respiratoryRate <= 14) score += 1;
    else if (respiratoryRate >= 15 && respiratoryRate <= 20) score += 0;
    else if (respiratoryRate >= 21 && respiratoryRate <= 29) score += 1;
    else if (respiratoryRate >= 30) score += 2;
  }

  // Temperature scoring
  const temp = Number(fieldValues.temperature);
  if (temp > 0) {
    hasAnyInput = true;
    if (temp <= 35) score += 3;
    else if (temp >= 35.1 && temp <= 36) score += 2;
    else if (temp >= 36.1 && temp <= 38) score += 1;
    else if (temp >= 38.1 && temp <= 38.5) score += 0;
    else if (temp >= 38.6) score += 2;
  }

  // Consciousness scoring - prioritize AVPU over GCS
  const avpu = fieldValues.level_of_consciousness;
  if (avpu) {
    hasAnyInput = true;
    switch (avpu.toLowerCase()) {
      case 'alert':
        score += 0;
        break;
      case 'verbal':
      case 'response to voice':
        score += 1;
        break;
      case 'pain':
      case 'response to pain':
        score += 2;
        break;
      case 'unresponsive':
        score += 3;
        break;
    }
  } else {
    // Use GCS if AVPU not available
    const gcsTotal = Number(fieldValues.gcs_total) || 
                    (Number(fieldValues.gcs_eye || 0) + 
                     Number(fieldValues.gcs_verbal || 0) + 
                     Number(fieldValues.gcs_motor || 0));
    
    if (gcsTotal > 0) {
      hasAnyInput = true;
      if (gcsTotal === 15) score += 0;
      else if (gcsTotal === 14) score += 1;
      else if (gcsTotal >= 9 && gcsTotal <= 13) score += 2;
      else if (gcsTotal <= 8) score += 3;
    }
  }

  return hasAnyInput ? score : null;
}

export function getMewsRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}