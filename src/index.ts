import {
    $query,
    $update,
    Record,
    StableBTreeMap,
    Vec,
    match,
    Result,
    nat64,
    ic,
    Opt,
  } from 'azle';
  import { v4 as uuidv4 } from 'uuid';
  
  type Patient = Record<{
    id: string;
    name: string;
    age: number;
    gender: string;
    admittedAt: Opt<nat64>;
    dischargedAt: Opt<nat64>;
    isAdmitted: boolean;
    medicalRecords: Vec<MedicalRecord>;
  }>;
  
  type PatientPayload = Record<{
    name: string;
    age: number;
    gender: string;
    medicalRecords: Vec<MedicalRecord>;
  }>;
  
  type MedicalRecord = Record<{
    id: string;
    patientId: string;
    diagnosis: string;
    treatment: string;
    date: nat64;
  }>;
  
  const patientStorage = new StableBTreeMap<string, Patient>(0, 44, 1024);
  
  /**
  * Adds a new patient to the system.
  * @param payload - Information about the patient.
  * @returns A Result containing the new patient or an error message.
  */
  $update;
  export function addPatient(payload: PatientPayload): Result<Patient, string> {
    // Validate inputs and handle incomplete or invalid data
    if (!payload.name || !payload.age || !payload.gender) {
        return Result.Err<Patient, string>('Missing required fields in the patient object');
    }
  
    try {
        // Generate a unique ID for the patient
        const patientId = uuidv4();
        // Initialize isAdmitted to false when adding a new patient
        const newPatient: Patient = {
            id: patientId,
            isAdmitted: false,
            admittedAt: Opt.None,
            dischargedAt: Opt.None,
            name: payload.name,
            age: payload.age,
            gender: payload.gender,
            medicalRecords: payload.medicalRecords
      
        };
  
        // Add the patient to patientStorage
        patientStorage.insert(newPatient.id, newPatient);
  
        return Result.Ok(newPatient);
    } catch (error) {
        return Result.Err<Patient, string>(`Error adding patient: ${error}`);
    }
  }
  
  /**
  * Retrieves all patients from the system.
  * @returns A Result containing a list of patients or an error message.
  */
  $query;
  export function getPatients(): Result<Vec<Patient>, string> {
    try {
        // Retrieve all patients from patientStorage
        const patients = patientStorage.values();
        return Result.Ok(patients);
    } catch (error) {
        return Result.Err(`Error getting patients: ${error}`);
    }
  }
  
  /**
  * Retrieves a specific patient by ID.
  * @param id - The ID of the patient to retrieve.
  * @returns A Result containing the patient or an error message.
  */
  $query;
  export function getPatient(id: string): Result<Patient, string> {
    // Validate ID
    if (!id) {
        return Result.Err<Patient, string>('Invalid ID for getting a patient.');
    }
  
    try {
        // Retrieve a specific patient by ID
        return match(patientStorage.get(id), {
            Some: (patient) => Result.Ok<Patient, string>(patient),
            None: () => Result.Err<Patient, string>(`Patient with id=${id} not found`),
        });
    } catch (error) {
        return Result.Err<Patient, string>(`Error retrieving patient by ID: ${error}`);
    }
  }
  
  /**
  * Updates information for a specific patient.
  * @param id - The ID of the patient to update.
  * @param payload - Updated information about the patient.
  * @returns A Result containing the updated patient or an error message.
  */
  $update;
  export function updatePatient(id: string, payload: PatientPayload): Result<Patient, string> {
    // Validate ID
    if (!id) {
        return Result.Err<Patient, string>('Invalid ID for updating a patient.');
    }
  
    // Validate the updated patient object
    if (!payload.name || !payload.age || !payload.gender) {
        return Result.Err<Patient, string>('Missing required fields in the patient object');
    }
  
    try {
        // Update a specific patient by ID
        return match(patientStorage.get(id), {
            Some: (existingPatient) => {
                // Create a new patient object with the updated fields
                const updatedPatient: Patient = {
                    ...existingPatient,
                    ...payload,
                };
  
                // Update the patient in patientStorage
                patientStorage.insert(id, updatedPatient);
  
                return Result.Ok<Patient, string>(updatedPatient);
            },
            None: () => Result.Err<Patient, string>(`Patient with id=${id} does not exist`),
        });
    } catch (error) {
        return Result.Err<Patient, string>(`Error updating patient: ${error}`);
    }
  }
  
  /**
  * Adds a medical record to a specific patient.
  * @param patientId - The ID of the patient.
  * @param medicalRecord - Information about the medical record to add.
  * @returns A Result containing the updated patient or an error message.
  */
  $update;
  export function addMedicalRecord(patientId: string, medicalRecord: MedicalRecord): Result<Patient, string> {
    // Validate ID
    if (!patientId) {
        return Result.Err<Patient, string>('Invalid patient ID for adding a medical record.');
    }
  
    try {
        // Add a medical record to a specific patient's records
        return match(patientStorage.get(patientId), {
            Some: (patient) => {
                // Update the patient's records with the new medical record
                const updatedPatient: Patient = {
                    ...patient,
                    medicalRecords: [...patient.medicalRecords, medicalRecord],
                };
  
                // Update the patient in patientStorage
                patientStorage.insert(patientId, updatedPatient);
  
                return Result.Ok<Patient, string>(updatedPatient);
            },
            None: () => Result.Err<Patient, string>(`Patient with id=${patientId} does not exist`),
        });
    } catch (error) {
        return Result.Err<Patient, string>(`Error adding medical record: ${error}`);
    }
  }
  
  /**
  * Updates a specific medical record for a specific patient.
  * @param patientId - The ID of the patient.
  * @param medicalRecordId - The ID of the medical record to update.
  * @param updatedMedicalRecord - Updated information for the medical record.
  * @returns A Result containing the updated patient or an error message.
  */
  $update;
  export function updateMedicalRecord(patientId: string, medicalRecordId: string, updatedMedicalRecord: MedicalRecord): Result<Patient, string> {
    // Validate IDs
    if (!patientId || !medicalRecordId) {
        return Result.Err<Patient, string>('Invalid patient or medical record ID for updating a medical record.');
    }
  
    try {
        // Update a specific medical record for a specific patient by IDs
        return match(patientStorage.get(patientId), {
            Some: (patient) => {
                // Find the index of the medical record to update
                const recordIndex = patient.medicalRecords.findIndex(record => record.id === medicalRecordId);
  
                // Check if the medical record exists
                if (recordIndex !== -1) {
                    // Create a new array with the updated medical record
                    const updatedMedicalRecords = [
                        ...patient.medicalRecords.slice(0, recordIndex),
                        updatedMedicalRecord,
                        ...patient.medicalRecords.slice(recordIndex + 1),
                    ];
  
                    // Update the patient in patientStorage
                    const updatedPatient: Patient = {
                        ...patient,
                        medicalRecords: updatedMedicalRecords,
                    };
                    patientStorage.insert(patientId, updatedPatient);
  
                    return Result.Ok<Patient, string>(updatedPatient);
                } else {
                    return Result.Err<Patient, string>(`Medical record with id=${medicalRecordId} not found for patient with id=${patientId}`);
                }
            },
            None: () => Result.Err<Patient, string>(`Patient with id=${patientId} does not exist`),
        });
    } catch (error) {
        return Result.Err<Patient, string>(`Error updating medical record: ${error}`);
    }
  }
  
  /**
  * Deletes a specific medical record for a specific patient.
  * @param patientId - The ID of the patient.
  * @param medicalRecordId - The ID of the medical record to delete.
  * @returns A Result containing the updated patient or an error message.
  */
  $update;
  export function deleteMedicalRecord(patientId: string, medicalRecordId: string): Result<Patient, string> {
    // Validate IDs
    if (!patientId || !medicalRecordId) {
        return Result.Err<Patient, string>('Invalid patient or medical record ID for deleting a medical record.');
    }
  
    try {
        // Delete a specific medical record for a specific patient by IDs
        return match(patientStorage.get(patientId), {
            Some: (patient) => {
                // Find the index of the medical record to delete
                const recordIndex = patient.medicalRecords.findIndex(record => record.id === medicalRecordId);
  
                // Check if the medical record exists
                if (recordIndex !== -1) {
                    // Remove the medical record from the array
                    const updatedMedicalRecords = [...patient.medicalRecords.slice(0, recordIndex), ...patient.medicalRecords.slice(recordIndex + 1)];
  
                    // Update the patient in patientStorage
                    const updatedPatient: Patient = {
                        ...patient,
                        medicalRecords: updatedMedicalRecords,
                    };
                    patientStorage.insert(patientId, updatedPatient);
  
                    return Result.Ok<Patient, string>(updatedPatient);
                } else {
                    return Result.Err<Patient, string>(`Medical record with id=${medicalRecordId} not found for patient with id=${patientId}`);
                }
            },
            None: () => Result.Err<Patient, string>(`Patient with id=${patientId} does not exist`),
        });
    } catch (error) {
        return Result.Err<Patient, string>(`Error deleting medical record: ${error}`);
    }
  }
  
  /**
  * Searches for patients based on a query.
  * @param query - The search query.
  * @returns A Result containing a list of matched patients or an error message.
  */
  $query;
  export function searchPatients(query: string): Result<Vec<Patient>, string> {
    try {
        // Search for patients based on the query
        const lowerCaseQuery = query.toLowerCase();
        const filteredPatients = patientStorage.values().filter(
            (patient) =>
                patient.name.toLowerCase().includes(lowerCaseQuery)
        );
        return Result.Ok(filteredPatients);
    } catch (error) {
        return Result.Err(`Error searching for patients: ${error}`);
    }
  }
  
  /**
  * Admits a specific patient.
  * @param id - The ID of the patient to admit.
  * @returns A Result containing the updated patient or an error message.
  */
  $update;
  export function admitPatient(id: string): Result<Patient, string> {
    // Validate ID
    if (!id) {
        return Result.Err<Patient, string>('Invalid ID for admitting a patient.');
    }
  
    try {
        // Admit a patient with a specific ID
        return match(patientStorage.get(id), {
            Some: (patient) => {
                if (patient.isAdmitted) {
                    return Result.Err<Patient, string>(`Patient with id=${id} is already admitted`);
                }
  
                const newPatient: Patient = { ...patient, isAdmitted: true, admittedAt: Opt.Some(ic.time()) };
                patientStorage.insert(id, newPatient);
  
                return Result.Ok<Patient, string>(newPatient);
            },
            None: () => Result.Err<Patient, string>(`Patient with id=${id} not found`),
        });
    } catch (error) {
        return Result.Err<Patient, string>(`Error admitting patient: ${error}`);
    }
  }

  /**
 * Retrieves the medical records of a specific patient by ID.
 * @param id - The ID of the patient.
 * @returns A Result containing the medical records or an error message.
 */
$query;
export function getMedicalRecords(id: string): Result<Vec<MedicalRecord>, string> {
    // Validate ID
    if (!id) {
        return Result.Err<Vec<MedicalRecord>, string>('Invalid ID for getting medical records.');
    }

    try {
        // Retrieve a specific patient by ID
        return match(patientStorage.get(id), {
            Some: (patient) => Result.Ok<Vec<MedicalRecord>, string>(patient.medicalRecords),
            None: () => Result.Err<Vec<MedicalRecord>, string>(`Patient with id=${id} not found`),
        });
    } catch (error) {
        return Result.Err<Vec<MedicalRecord>, string>(`Error retrieving medical records by ID: ${error}`);
    }
}

  
  /**
  * Discharges a specific patient.
  * @param id - The ID of the patient to discharge.
  * @returns A Result containing the updated patient or an error message.
  */
  $update;
  export function dischargePatient(id: string): Result<Patient, string> {
    // Validate ID
    if (!id) {
        return Result.Err<Patient, string>('Invalid ID for discharging a patient.');
    }
  
    try {
        // Discharge a patient with a specific ID
        return match(patientStorage.get(id), {
            Some: (patient) => {
                if (!patient.isAdmitted) {
                    return Result.Err<Patient, string>(`Patient with id=${id} is not currently admitted`);
                }
  
                const newPatient: Patient = { ...patient, isAdmitted: false, dischargedAt: Opt.Some(ic.time()) };
                patientStorage.insert(id, newPatient);
  
                return Result.Ok<Patient, string>(newPatient);
            },
            None: () => Result.Err<Patient, string>(`Patient with id=${id} not found`),
        });
    } catch (error) {
        return Result.Err<Patient, string>(`Error discharging patient: ${error}`);
    }
  }
  
  /**
  * Deletes a specific patient.
  * @param id - The ID of the patient to delete.
  * @returns A Result containing the deleted patient or an error message.
  */
  $update;
  export function deletePatient(id: string): Result<Opt<Patient>, string> {
    try {
        // Validate the id parameter
        if (!isValidUUID(id)) {
            return Result.Err('Invalid patient ID');
        }
  
        // Delete a patient with a specific ID from patientStorage
        const deletedPatient = patientStorage.remove(id);
        if (!deletedPatient) {
            return Result.Err(`Patient with ID ${id} does not exist`);
        }
  
        return Result.Ok(deletedPatient);
    } catch (error) {
        return Result.Err(`Error deleting patient: ${error}`);
    }
  }
  
  /**
  * Validates whether a given string is a valid UUID.
  * @param id - The string to validate as a UUID.
  * @returns True if the string is a valid UUID, otherwise false.
  */
  export function isValidUUID(id: string): boolean {
    // Validate if the provided ID is a valid UUID
    return /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(id);
  }
  
  // A workaround to make the uuid package work with Azle
  globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);
  
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
  
        return array;
    },
  };
  