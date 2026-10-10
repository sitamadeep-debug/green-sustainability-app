/* ==========================================================================
   EcoSustain Supabase Cloud Database Client
   ========================================================================== */

(function () {
    function normalizeUrl(url) {
        if (!url) return '';
        return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    }

    const savedUrl = normalizeUrl(localStorage.getItem('ecosustain_supabase_url') || '');
    const savedKey = (localStorage.getItem('ecosustain_supabase_key') || '').trim();

    let client = null;

    if (typeof supabase !== 'undefined' && savedUrl && savedKey) {
        try {
            client = supabase.createClient(savedUrl, savedKey);
            console.log('✅ [EcoSustain] Supabase Connected to:', savedUrl);
        } catch (e) {
            console.warn('⚠️ [EcoSustain] Failed to initialize Supabase client:', e.message);
        }
    } else {
        console.log('ℹ️ [EcoSustain] Running in Local Storage Mode. Connect Supabase for Cloud Sync.');
    }

    window.EcoDB = {
        get client() {
            return client;
        },

        isCloudConnected() {
            return !!client;
        },

        getConfig() {
            return {
                url: localStorage.getItem('ecosustain_supabase_url') || '',
                key: localStorage.getItem('ecosustain_supabase_key') || ''
            };
        },

        saveConfig(url, key) {
            const cleanUrl = normalizeUrl(url);
            const cleanKey = (key || '').trim();
            localStorage.setItem('ecosustain_supabase_url', cleanUrl);
            localStorage.setItem('ecosustain_supabase_key', cleanKey);
            window.location.reload();
        },

        disconnectCloud() {
            localStorage.removeItem('ecosustain_supabase_url');
            localStorage.removeItem('ecosustain_supabase_key');
            window.location.reload();
        },

        async testConnection(testUrl, testKey) {
            const targetUrl = normalizeUrl(testUrl || localStorage.getItem('ecosustain_supabase_url') || '');
            const targetKey = (testKey || localStorage.getItem('ecosustain_supabase_key') || '').trim();

            if (!targetUrl || !targetKey) {
                return { success: false, message: 'URL and Anon Key must not be empty.' };
            }

            try {
                const tempClient = supabase.createClient(targetUrl, targetKey);
                const { data, error } = await tempClient.from('company_profiles').select('id').limit(1);
                if (error) {
                    return { success: false, message: error.message };
                }
                return { success: true, message: 'Successfully connected to Supabase database!' };
            } catch (err) {
                return { success: false, message: err.message || 'Connection failed.' };
            }
        },

        async syncFromCloud() {
            if (!client) return { success: false, message: 'Not connected to Supabase.' };

            try {
                // Fetch profiles
                const { data: profiles, error: pErr } = await client.from('company_profiles').select('*').limit(1);
                if (!pErr && profiles && profiles.length > 0) {
                    window.EcoState.profile = {
                        companyName: profiles[0].company_name,
                        sector: profiles[0].sector,
                        points: profiles[0].points || 40,
                        level: profiles[0].level || 'Green Innovator'
                    };
                }

                // Fetch records
                const { data: records, error: rErr } = await client.from('green_records').select('*').order('created_at', { ascending: true });
                if (!rErr && records) {
                    window.EcoState.records = records.map(r => ({
                        id: r.id,
                        year: r.year,
                        month: r.month,
                        electricity: parseFloat(r.electricity) || 0,
                        electricityCost: parseFloat(r.electricity_cost) || 0,
                        water: parseFloat(r.water) || 0,
                        waterCost: parseFloat(r.water_cost) || 0,
                        plastic: parseFloat(r.plastic) || 0,
                        paper: parseFloat(r.paper) || 0,
                        organicMaterials: parseFloat(r.organic_materials) || 0,
                        wasteOrganic: parseFloat(r.waste_organic) || 0,
                        wasteInorganic: parseFloat(r.waste_inorganic) || 0,
                        wasteRecycled: parseFloat(r.waste_recycled) || 0,
                        fuelType: r.fuel_type || 'Petrol',
                        fuelQty: parseFloat(r.fuel_qty) || 0,
                        emissions: parseFloat(r.emissions) || 0
                    }));
                }

                // Fetch innovations
                const { data: innovations, error: iErr } = await client.from('green_innovations').select('*');
                if (!iErr && innovations) {
                    window.EcoState.innovations = innovations.map(i => ({
                        id: i.id,
                        title: i.title,
                        type: i.type,
                        cost: parseFloat(i.cost) || 0,
                        savings: parseFloat(i.savings) || 0,
                        status: i.status,
                        desc: i.description
                    }));
                }

                // Fetch targets
                const { data: targets, error: tErr } = await client.from('eco_targets').select('*');
                if (!tErr && targets) {
                    window.EcoState.targets = targets.map(t => ({
                        id: t.id,
                        metric: t.metric,
                        val: parseFloat(t.val) || 0,
                        month: t.month,
                        achieved: !!t.achieved
                    }));
                }

                window.EcoState.saveState();
                return { success: true, message: 'Data successfully synced from Supabase Cloud!' };
            } catch (err) {
                console.error('Error syncing from cloud:', err);
                return { success: false, message: err.message };
            }
        },

        async syncToCloud() {
            if (!client) return { success: false, message: 'Not connected to Supabase.' };

            try {
                // Upsert Profile
                const profile = window.EcoState.profile;
                await client.from('company_profiles').upsert({
                    id: 'current',
                    company_name: profile.companyName,
                    sector: profile.sector,
                    points: profile.points,
                    level: profile.level,
                    updated_at: new Date().toISOString()
                });

                // Upsert Records
                for (const r of window.EcoState.records) {
                    await client.from('green_records').upsert({
                        year: r.year,
                        month: r.month,
                        electricity: r.electricity,
                        electricity_cost: r.electricityCost,
                        water: r.water,
                        water_cost: r.waterCost,
                        plastic: r.plastic,
                        paper: r.paper,
                        organic_materials: r.organicMaterials,
                        waste_organic: r.wasteOrganic,
                        waste_inorganic: r.wasteInorganic,
                        waste_recycled: r.wasteRecycled,
                        fuel_type: r.fuelType,
                        fuel_qty: r.fuelQty,
                        emissions: r.emissions
                    }, { onConflict: 'year,month' });
                }

                // Upsert Innovations
                for (const i of window.EcoState.innovations) {
                    await client.from('green_innovations').upsert({
                        id: i.id,
                        title: i.title,
                        type: i.type,
                        cost: i.cost,
                        savings: i.savings,
                        status: i.status,
                        description: i.desc
                    });
                }

                // Upsert Targets
                for (const t of window.EcoState.targets) {
                    await client.from('eco_targets').upsert({
                        id: t.id,
                        metric: t.metric,
                        val: t.val,
                        month: t.month,
                        achieved: t.achieved
                    });
                }

                return { success: true, message: 'All local data successfully pushed to Supabase Cloud!' };
            } catch (err) {
                console.error('Error syncing to cloud:', err);
                return { success: false, message: err.message };
            }
        }
    };
})();
