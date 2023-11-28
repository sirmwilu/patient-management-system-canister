export const idlFactory = ({ IDL }) => {
  const MedicalRecord = IDL.Record({
    'id' : IDL.Text,
    'patientId' : IDL.Text,
    'date' : IDL.Nat64,
    'treatment' : IDL.Text,
    'diagnosis' : IDL.Text,
  });
  const Patient = IDL.Record({
    'id' : IDL.Text,
    'age' : IDL.Float64,
    'admittedAt' : IDL.Opt(IDL.Nat64),
    'name' : IDL.Text,
    'medicalRecords' : IDL.Vec(MedicalRecord),
    'gender' : IDL.Text,
    'dischargedAt' : IDL.Opt(IDL.Nat64),
    'isAdmitted' : IDL.Bool,
  });
  const _AzleResult = IDL.Variant({ 'Ok' : Patient, 'Err' : IDL.Text });
  const PatientPayload = IDL.Record({
    'age' : IDL.Float64,
    'name' : IDL.Text,
    'medicalRecords' : IDL.Vec(MedicalRecord),
    'gender' : IDL.Text,
  });
  const _AzleResult_1 = IDL.Variant({
    'Ok' : IDL.Opt(Patient),
    'Err' : IDL.Text,
  });
  const _AzleResult_2 = IDL.Variant({
    'Ok' : IDL.Vec(MedicalRecord),
    'Err' : IDL.Text,
  });
  const _AzleResult_3 = IDL.Variant({
    'Ok' : IDL.Vec(Patient),
    'Err' : IDL.Text,
  });
  return IDL.Service({
    'addMedicalRecord' : IDL.Func([IDL.Text, MedicalRecord], [_AzleResult], []),
    'addPatient' : IDL.Func([PatientPayload], [_AzleResult], []),
    'admitPatient' : IDL.Func([IDL.Text], [_AzleResult], []),
    'deleteMedicalRecord' : IDL.Func([IDL.Text, IDL.Text], [_AzleResult], []),
    'deletePatient' : IDL.Func([IDL.Text], [_AzleResult_1], []),
    'dischargePatient' : IDL.Func([IDL.Text], [_AzleResult], []),
    'getMedicalRecords' : IDL.Func([IDL.Text], [_AzleResult_2], ['query']),
    'getPatient' : IDL.Func([IDL.Text], [_AzleResult], ['query']),
    'getPatients' : IDL.Func([], [_AzleResult_3], ['query']),
    'searchPatients' : IDL.Func([IDL.Text], [_AzleResult_3], ['query']),
    'updateMedicalRecord' : IDL.Func(
        [IDL.Text, IDL.Text, MedicalRecord],
        [_AzleResult],
        [],
      ),
    'updatePatient' : IDL.Func([IDL.Text, PatientPayload], [_AzleResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
