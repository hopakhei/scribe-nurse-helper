import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Printer } from 'lucide-react';
import { mapAssessmentToHandoverData } from '@/utils/handoverDataMapper';

interface HandoverFormPrintProps {
  patient: any;
  fieldValues: Record<string, any>;
  riskScores: any;
  assessmentId: string;
}

const HandoverFormPrint: React.FC<HandoverFormPrintProps> = ({
  patient,
  fieldValues,
  riskScores,
  assessmentId
}) => {
  const handoverData = mapAssessmentToHandoverData(patient, fieldValues, riskScores);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 min-h-[48px] px-6">
          <Printer className="h-4 w-4" />
          Print Handover Form
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="print:hidden">
          <DialogTitle>S9A Clinical Handover Notes - Print Preview</DialogTitle>
          <DialogDescription>
            Review the populated handover form before printing
          </DialogDescription>
          <Button onClick={handlePrint} className="w-fit">
            <Printer className="h-4 w-4 mr-2" />
            Print Form
          </Button>
        </DialogHeader>
        
        <div className="handover-form print:p-0 print:m-0">
          {/* Hospital Header */}
          <div className="text-center mb-6 print:mb-4">
            <h1 className="text-xl font-bold print:text-base">CHANGI GENERAL HOSPITAL</h1>
            <h2 className="text-lg font-semibold print:text-sm">S9A CLINICAL HANDOVER NOTES</h2>
          </div>

          {/* Patient Information Section */}
          <div className="grid grid-cols-2 gap-4 mb-6 print:mb-4 print:text-xs">
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="font-medium min-w-[100px]">Name:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.patientName}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium min-w-[100px]">Hospital No:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.hospitalNo}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium min-w-[100px]">Age:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.age}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium min-w-[100px]">Sex:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.sex}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="font-medium min-w-[100px]">Ward:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.ward}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium min-w-[100px]">Bed:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.bed}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium min-w-[100px]">Date:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.date}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium min-w-[100px]">Time:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.time}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6 print:mb-4">
            <h3 className="font-semibold text-sm mb-2 print:text-xs">CONTACT INFORMATION</h3>
            <div className="grid grid-cols-2 gap-4 print:text-xs">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">Next of Kin:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.nextOfKin}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">Relationship:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.relationship}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">Contact Number:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.contactNumber}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">Address:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="mb-6 print:mb-4">
            <h3 className="font-semibold text-sm mb-2 print:text-xs">MEDICAL INFORMATION</h3>
            <div className="space-y-2 print:text-xs">
              <div className="flex gap-2">
                <span className="font-medium min-w-[150px]">Admission Date:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.admissionDate}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium min-w-[150px]">Admission Type:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.admissionType}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium min-w-[150px]">Current Complaints:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.currentComplaints}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium min-w-[150px]">Diagnosis:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.diagnosis}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium min-w-[150px]">Allergies:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.allergies}</span>
              </div>
            </div>
          </div>

          {/* Risk Scores */}
          <div className="mb-6 print:mb-4">
            <h3 className="font-semibold text-sm mb-2 print:text-xs">RISK ASSESSMENT SCORES</h3>
            <div className="grid grid-cols-2 gap-4 print:text-xs">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">Morse Fall Scale:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.morseScore}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">MST Score:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.mstScore}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">Norton Scale:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.nortonScore}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[120px]">Braden Scale:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.bradenScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="mb-6 print:mb-4">
            <h3 className="font-semibold text-sm mb-2 print:text-xs">VITAL SIGNS</h3>
            <div className="grid grid-cols-3 gap-4 print:text-xs">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="font-medium min-w-[80px]">BP:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.bloodPressure}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[80px]">Pulse:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.pulse}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="font-medium min-w-[80px]">Temp:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.temperature}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[80px]">SpO2:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.oxygenSaturation}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="font-medium min-w-[80px]">RR:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.respiratoryRate}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium min-w-[80px]">Weight:</span>
                  <span className="border-b border-gray-400 flex-1 px-1">{handoverData.weight}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment and Devices */}
          <div className="mb-6 print:mb-4">
            <h3 className="font-semibold text-sm mb-2 print:text-xs">EQUIPMENT & DEVICES</h3>
            <div className="grid grid-cols-2 gap-4 print:text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={handoverData.oxygenTherapy} readOnly />
                  <span>Oxygen Therapy</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={handoverData.ivAccess} readOnly />
                  <span>IV Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={handoverData.catheter} readOnly />
                  <span>Catheter</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={handoverData.pacemaker} readOnly />
                  <span>Pacemaker</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={handoverData.mobility} readOnly />
                  <span>Mobility Aid</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={handoverData.fallRisk} readOnly />
                  <span>Fall Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-6 print:mb-4">
            <h3 className="font-semibold text-sm mb-2 print:text-xs">ADDITIONAL NOTES</h3>
            <div className="border border-gray-400 min-h-[100px] p-2 print:min-h-[80px] print:text-xs">
              {handoverData.additionalNotes}
            </div>
          </div>

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-8 mt-8 print:mt-6 print:text-xs">
            <div>
              <div className="flex gap-2 mb-4">
                <span className="font-medium">Prepared by:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.preparedBy}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium">Signature:</span>
                <span className="border-b border-gray-400 flex-1 px-1"></span>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="font-medium">Date/Time:</span>
                <span className="border-b border-gray-400 flex-1 px-1">{handoverData.currentDateTime}</span>
              </div>
            </div>
            <div>
              <div className="flex gap-2 mb-4">
                <span className="font-medium">Received by:</span>
                <span className="border-b border-gray-400 flex-1 px-1"></span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium">Signature:</span>
                <span className="border-b border-gray-400 flex-1 px-1"></span>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="font-medium">Date/Time:</span>
                <span className="border-b border-gray-400 flex-1 px-1"></span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HandoverFormPrint;