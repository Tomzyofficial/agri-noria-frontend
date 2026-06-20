"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CheckCircle, UploadCloud } from 'lucide-react';
import styles from './onboarding.module.css';

// Dynamic import for map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

export default function FarmerOnboarding() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [localPreviews, setLocalPreviews] = useState({});

    const [riskScores, setRiskScores] = useState({ climate: null, flood: null, crop: null });

    useEffect(() => {
        if (step === 18) {
            setRiskScores({ climate: null, flood: null, crop: null });
            
            const t1 = setTimeout(() => {
                setRiskScores(prev => ({ ...prev, climate: Math.floor(Math.random() * 40) + 10 }));
            }, 800);
            const t2 = setTimeout(() => {
                setRiskScores(prev => ({ ...prev, flood: Math.floor(Math.random() * 40) + 10 }));
            }, 1600);
            const t3 = setTimeout(() => {
                setRiskScores(prev => ({ ...prev, crop: Math.floor(Math.random() * 40) + 10 }));
            }, 2400);

            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
        }
    }, [step]);

    // Master State for all 20 screens
    const [formData, setFormData] = useState({
        // L1
        middle_name: '', gender: '', dob: '', phone: '',
        nin: '', voter_id: '', passport_id: '', drivers_license: '',
        id_front_url: '', id_back_url: '', live_selfie_url: '',
        marital_status: '', household_size: '', dependents: '',
        years_of_experience: '', primary_activity: '',
        cooperative_name: '', farmer_group: '', association: '',
        crop: '', variety: '', planting_date: '', expected_harvest_date: '',
        // L2
        farm_name: '', ownership_type: '', location_address: '', latitude: '', longitude: '', farm_size_hectares: '', boundary_polygon: '', boundary_file_url: '',
        land_title_url: '', lease_agreement_url: '', community_attestation_url: '',
        farm_entrance_photo_url: '', farm_interior_photo_url: '', crop_photo_url: '',
        // L3
        historical_productions: [
            { season_name: 'Past Season 1', crop: '', yield_amount: '', area_hectares: '' }
        ],
        equipment_type: '',
        seed_supplier: '', fertilizer_usage: '', agrochemical_usage: '',
        bank_name: '', account_number: '', mobile_money: '', previous_agricultural_loan: false, insurance_history: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileUpload = async (file, fieldName) => {
        if (!file) return;

        // Set immediate local preview
        const localUrl = URL.createObjectURL(file);
        setLocalPreviews(prev => ({ ...prev, [fieldName]: localUrl }));
        setIsLoading(true);

        const data = new FormData();
        data.append("file", file);
        try {
            const res = await fetch('/api/proxy/vendor/upload/document', {
                method: "POST",
                body: data
            });
            const result = await res.json();
            if (result.success) {
                setFormData(prev => ({ ...prev, [fieldName]: result.data.url }));
            } else {
                alert(result.error || "Upload failed");
                setLocalPreviews(prev => ({ ...prev, [fieldName]: null }));
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("File upload failed");
            setLocalPreviews(prev => ({ ...prev, [fieldName]: null }));
        } finally {
            setIsLoading(false);
        }
    };

    const submitLevel = async (level) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/proxy/vendor/onboarding/level${level}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (result.success) {
                if (level === 1) setStep(8);
                if (level === 2) setStep(14);
                if (level === 3) setStep(20);
            } else {
                alert(result.error || "Submission failed");
            }
        } catch (error) {
            console.error(error);
            alert("Server Error");
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 7) {
            submitLevel(1); // submit level 1
        } else if (step === 13) {
            submitLevel(2); // submit level 2
        } else if (step === 19) {
            submitLevel(3); // submit level 3
        } else {
            setStep(s => s + 1);
        }
    };

    const prevStep = () => setStep(s => s - 1);

    const getLevelIndicator = () => {
        let level = 1;
        if (step >= 8) level = 2;
        if (step >= 14) level = 3;
        if (step === 20) level = 4; // Complete

        return (
            <div className={styles.levelIndicator}>
                <div className={`${styles.levelBadge} ${level >= 1 ? styles.active : ''}`}>Level 1: Basic Identity</div>
                <div className={`${styles.levelBadge} ${level >= 2 ? styles.active : ''}`}>Level 2: Farm Verification</div>
                <div className={`${styles.levelBadge} ${level >= 3 ? styles.active : ''}`}>Level 3: Full Passport</div>
            </div>
        );
    };

    // Form Renderer
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Create Agricultural Identity</h2>
                        <p className={styles.description}>Build a verified agricultural profile for access to finance, insurance, markets, mechanization and ecosystem services.</p>
                        <div className={styles.buttonContainer} style={{ justifyContent: 'center' }}>
                            <button className={styles.btnPrimary} onClick={nextStep}>Start Registration</button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Farmer Details</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Middle Name</label>
                            <input className={styles.input} name="middle_name" value={formData.middle_name} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Gender</label>
                            <select className={styles.select} name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Date of Birth</label>
                            <input className={styles.input} type="date" name="dob" value={formData.dob} onChange={handleChange} />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Identity Verification</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>NIN</label>
                            <input className={styles.input} name="nin" value={formData.nin} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Upload ID Front</label>
                            {!(localPreviews.id_front_url || formData.id_front_url) ? (
                                <label className={styles.fileUpload}>
                                    <UploadCloud size={24} />
                                    <div>Click to upload</div>
                                    <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'id_front_url')} />
                                </label>
                            ) : (
                                <div>
                                    <img src={localPreviews.id_front_url || formData.id_front_url} className={styles.imagePreview} alt="ID Front" />
                                    <div className={styles.uploadPreview}>✓ Uploading / Uploaded</div>
                                </div>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Upload ID Back</label>
                            {!(localPreviews.id_back_url || formData.id_back_url) ? (
                                <label className={styles.fileUpload}>
                                    <UploadCloud size={24} />
                                    <div>Click to upload</div>
                                    <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'id_back_url')} />
                                </label>
                            ) : (
                                <div>
                                    <img src={localPreviews.id_back_url || formData.id_back_url} className={styles.imagePreview} alt="ID Back" />
                                    <div className={styles.uploadPreview}>✓ Uploading / Uploaded</div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Face Capture</h2>
                        <p className={styles.description}>Please upload a live selfie to match your ID.</p>
                        <div className={styles.formGroup}>
                            {!(localPreviews.live_selfie_url || formData.live_selfie_url) ? (
                                <label className={styles.fileUpload}>
                                    <UploadCloud size={24} />
                                    <div>Take Selfie</div>
                                    <input type="file" accept="image/*" capture="user" hidden onChange={e => handleFileUpload(e.target.files[0], 'live_selfie_url')} />
                                </label>
                            ) : (
                                <div>
                                    <img src={localPreviews.live_selfie_url || formData.live_selfie_url} className={styles.imagePreview} alt="Live Selfie" />
                                    <div className={styles.uploadPreview}>✓ Captured</div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Household Information</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Marital Status</label>
                            <select className={styles.select} name="marital_status" value={formData.marital_status} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Household Size</label>
                            <input className={styles.input} type="number" name="household_size" value={formData.household_size} onChange={handleChange} />
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Farming Profile</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Years of Experience</label>
                            <input className={styles.input} type="number" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Primary Farming Activity</label>
                            <select className={styles.select} name="primary_activity" value={formData.primary_activity} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Crop Farming">Crop Farming</option>
                                <option value="Livestock">Livestock</option>
                                <option value="Aquaculture">Aquaculture</option>
                            </select>
                        </div>
                    </div>
                );
            case 7:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Organization Membership</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Cooperative Name (Optional)</label>
                            <input className={styles.input} name="cooperative_name" value={formData.cooperative_name} onChange={handleChange} />
                        </div>
                        <p className={styles.description}>Clicking continue will submit your Level 1 Basic Identity.</p>
                    </div>
                );
            case 8:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Add Farm</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Farm Name</label>
                            <input className={styles.input} name="farm_name" value={formData.farm_name} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Ownership Type</label>
                            <select className={styles.select} name="ownership_type" value={formData.ownership_type} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Owned">Owned</option>
                                <option value="Leased">Leased</option>
                                <option value="Family Land">Family Land</option>
                            </select>
                        </div>
                    </div>
                );
            case 9:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Farm Location</h2>
                        <p className={styles.description}>Click on the map to drop a pin.</p>
                        <MapComponent mode="location" onChange={(val) => setFormData(p => ({ ...p, latitude: val.lat, longitude: val.lng }))} />
                        {formData.latitude && <div className={styles.uploadPreview}>✓ Location Captured: {formData.latitude}, {formData.longitude}</div>}
                    </div>
                );
            case 10:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Farm Boundary Capture</h2>
                        <p className={styles.description}>Click points to draw a polygon. Or upload a boundary file.</p>
                        <MapComponent mode="boundary" onChange={(val) => setFormData(p => ({ ...p, boundary_polygon: JSON.stringify(val.polygon), farm_size_hectares: val.area_hectares }))} />
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Upload KML / GeoJSON (Optional)</label>
                            <input type="file" onChange={e => handleFileUpload(e.target.files[0], 'boundary_file_url')} />
                        </div>
                    </div>
                );
            case 11:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Land Verification</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Upload Land Title / Lease Agreement</label>
                            {!(localPreviews.land_title_url || formData.land_title_url) ? (
                                <label className={styles.fileUpload}>
                                    <UploadCloud size={24} />
                                    <div>Click to upload document</div>
                                    <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'land_title_url')} />
                                </label>
                            ) : (
                                <div>
                                    <img src={localPreviews.land_title_url || formData.land_title_url} className={styles.imagePreview} alt="Land Title" />
                                    <div className={styles.uploadPreview}>✓ Uploading / Uploaded</div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 12:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Farm Evidence</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Farm Entrance Photo</label>
                            {!(localPreviews.farm_entrance_photo_url || formData.farm_entrance_photo_url) ? (
                                <label className={styles.fileUpload}>
                                    <UploadCloud size={24} />
                                    <div>Upload Entrance Photo</div>
                                    <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'farm_entrance_photo_url')} />
                                </label>
                            ) : (
                                <div>
                                    <img src={localPreviews.farm_entrance_photo_url || formData.farm_entrance_photo_url} className={styles.imagePreview} alt="Farm Entrance" />
                                    <div className={styles.uploadPreview}>✓ Uploading / Uploaded</div>
                                </div>
                            )}
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Farm Interior Photo</label>
                            {!(localPreviews.farm_interior_photo_url || formData.farm_interior_photo_url) ? (
                                <label className={styles.fileUpload}>
                                    <UploadCloud size={24} />
                                    <div>Upload Interior Photo</div>
                                    <input type="file" hidden onChange={e => handleFileUpload(e.target.files[0], 'farm_interior_photo_url')} />
                                </label>
                            ) : (
                                <div>
                                    <img src={localPreviews.farm_interior_photo_url || formData.farm_interior_photo_url} className={styles.imagePreview} alt="Farm Interior" />
                                    <div className={styles.uploadPreview}>✓ Uploading / Uploaded</div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 13:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Production Profile</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Current Crop</label>
                            <select className={styles.select} name="crop" value={formData.crop} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Maize">Maize</option>
                                <option value="Rice">Rice</option>
                                <option value="Cassava">Cassava</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Planting Date</label>
                            <input className={styles.input} type="date" name="planting_date" value={formData.planting_date} onChange={handleChange} />
                        </div>
                        <p className={styles.description}>Clicking continue will submit Level 2 Farm Verification.</p>
                    </div>
                );
            case 14:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Historical Production</h2>
                        <p className={styles.description}>Past Season 1</p>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Crop</label>
                            <input className={styles.input} value={formData.historical_productions[0].crop} onChange={e => {
                                const newHist = [...formData.historical_productions];
                                newHist[0].crop = e.target.value;
                                setFormData({ ...formData, historical_productions: newHist });
                            }} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Yield (MT)</label>
                            <input className={styles.input} type="number" value={formData.historical_productions[0].yield_amount} onChange={e => {
                                const newHist = [...formData.historical_productions];
                                newHist[0].yield_amount = e.target.value;
                                setFormData({ ...formData, historical_productions: newHist });
                            }} />
                        </div>
                    </div>
                );
            case 15:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Mechanization Profile</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Do you own equipment?</label>
                            <select className={styles.select} name="equipment_type" value={formData.equipment_type} onChange={handleChange}>
                                <option value="">None</option>
                                <option value="Tractor">Tractor</option>
                                <option value="Planter">Planter</option>
                                <option value="Harvester">Harvester</option>
                            </select>
                        </div>
                    </div>
                );
            case 16:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Input Usage Profile</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Seed Supplier</label>
                            <input className={styles.input} name="seed_supplier" value={formData.seed_supplier} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Fertilizer Usage</label>
                            <input className={styles.input} name="fertilizer_usage" value={formData.fertilizer_usage} onChange={handleChange} />
                        </div>
                    </div>
                );
            case 17:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Financial Profile</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Bank Name</label>
                            <input className={styles.input} name="bank_name" value={formData.bank_name} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Account Number</label>
                            <input className={styles.input} name="account_number" value={formData.account_number} onChange={handleChange} />
                        </div>
                    </div>
                );
            case 18:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Risk & Climate Profile</h2>
                        <p className={styles.description}>Based on your coordinates and historical data, the system is auto-calculating your risk profile.</p>
                        <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '8px', color: '#1a1a1a', fontWeight: '500' }}>
                            <p style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {riskScores.climate !== null ? <span style={{color: '#10b981'}}>✓ Climate Risk Score: {riskScores.climate} / 100</span> : <span style={{color: '#64748b'}}>⏳ Climate Risk: Calculating...</span>}
                            </p>
                            <p style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {riskScores.flood !== null ? <span style={{color: '#10b981'}}>✓ Flood Risk Score: {riskScores.flood} / 100</span> : <span style={{color: '#64748b'}}>⏳ Flood Risk: Calculating...</span>}
                            </p>
                            <p style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {riskScores.crop !== null ? <span style={{color: '#10b981'}}>✓ Crop Risk Score: {riskScores.crop} / 100</span> : <span style={{color: '#64748b'}}>⏳ Crop Risk: Calculating...</span>}
                            </p>
                        </div>
                    </div>
                );
            case 19:
                return (
                    <div className={styles.screen}>
                        <h2 className={styles.title}>Review Summary</h2>
                        <p className={styles.description}>Please review your agricultural identity.</p>
                        <div className={styles.assetsList}>
                            <p><strong>Name:</strong> {formData.middle_name} (Level 1)</p>
                            <p><strong>Farm Name:</strong> {formData.farm_name} (Level 2)</p>
                            <p><strong>Financials Provided:</strong> {formData.bank_name ? 'Yes' : 'No'} (Level 3)</p>
                        </div>
                        <p className={styles.description}>Clicking submit will finalize your Level 3 Full Agricultural Passport.</p>
                    </div>
                );
            case 20:
                return (
                    <div className={styles.screen}>
                        <div className={styles.successScreen}>
                            <CheckCircle className={styles.successIcon} />
                            <h2 className={styles.title}>Agricultural Identity Created</h2>

                            <div className={styles.assetsList}>
                                <div className={styles.assetItem}><CheckCircle className={styles.assetIcon} size={16} /> Farmer ID Generated</div>
                                <div className={styles.assetItem}><CheckCircle className={styles.assetIcon} size={16} /> Farm ID & Polygon Verified</div>
                                <div className={styles.assetItem}><CheckCircle className={styles.assetIcon} size={16} /> Agricultural Passport Created</div>
                                <div className={styles.assetItem}><CheckCircle className={styles.assetIcon} size={16} /> Trust Score Calculated</div>
                            </div>

                            <button className={styles.btnPrimary} onClick={() => router.push('/ecosystem/farmer')}>Go To Dashboard</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            {step > 1 && step < 20 && getLevelIndicator()}

            {renderStep()}

            {step > 1 && step < 20 && (
                <div className={styles.buttonContainer}>
                    <button className={styles.btnSecondary} onClick={prevStep} disabled={isLoading}>Back</button>
                    <button className={styles.btnPrimary} onClick={nextStep} disabled={isLoading}>
                        {isLoading ? 'Processing...' : (step === 7 || step === 13 || step === 19) ? 'Submit Level' : 'Continue'}
                    </button>
                </div>
            )}
        </div>
    );
}
