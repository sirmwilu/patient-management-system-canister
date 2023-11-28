import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface MedicalRecord {
  'id' : string,
  'patientId' : string,
  'date' : bigint,
  'treatment' : string,
  'diagnosis' : string,
}
export interface Patient {
  'id' : string,
  'age' : number,
  'admittedAt' : [] | [bigint],
  'name' : string,
  'medicalRecords' : Array<MedicalRecord>,
  'gender' : string,
  'dischargedAt' : [] | [bigint],
  'isAdmitted' : boolean,
}
export interface PatientPayload {
  'age' : number,
  'name' : string,
  'medicalRecords' : Array<MedicalRecord>,
  'gender' : string,
}
export type _AzleResult = { 'Ok' : Patient } |
  { 'Err' : string };
export type _AzleResult_1 = { 'Ok' : [] | [Patient] } |
  { 'Err' : string };
export type _AzleResult_2 = { 'Ok' : Array<MedicalRecord> } |
  { 'Err' : string };
export type _AzleResult_3 = { 'Ok' : Array<Patient> } |
  { 'Err' : string };
export interface _SERVICE {
  'addMedicalRecord' : ActorMethod<[string, MedicalRecord], _AzleResult>,
  'addPatient' : ActorMethod<[PatientPayload], _AzleResult>,
  'admitPatient' : ActorMethod<[string], _AzleResult>,
  'deleteMedicalRecord' : ActorMethod<[string, string], _AzleResult>,
  'deletePatient' : ActorMethod<[string], _AzleResult_1>,
  'dischargePatient' : ActorMethod<[string], _AzleResult>,
  'getMedicalRecords' : ActorMethod<[string], _AzleResult_2>,
  'getPatient' : ActorMethod<[string], _AzleResult>,
  'getPatients' : ActorMethod<[], _AzleResult_3>,
  'searchPatients' : ActorMethod<[string], _AzleResult_3>,
  'updateMedicalRecord' : ActorMethod<
    [string, string, MedicalRecord],
    _AzleResult
  >,
  'updatePatient' : ActorMethod<[string, PatientPayload], _AzleResult>,
}
