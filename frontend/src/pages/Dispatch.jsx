/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Search, MapPin, Clock, Zap, CheckCircle,
  Loader2, ChevronRight, Truck, User, Shield, Flame,
  Wind, Radio, Activity
} from 'lucide-react';
import { incidentsApi } from '../api/incidents';
import { dispatchApi } from '../api/dispatch';
import toast from 'react-hot-toast';

const SEVERITY_COLOR = {
  CRITICAL: { bg: '#fef2f2', text: '#dc2626', badge: '#dc2626' },
  HIGH:     { bg: '#fff7ed', text: '#ea580c', badge: '#ea580c' },
  MEDIUM:   { bg: '#fefce8', text: '#ca8a04', badge: '#ca8a04' },
  LOW:      { bg: '#f0fdf4', text: '#16a34a', badge: '#16a34a' },
};

const UNIT_ICON_MAP = {
  AMBULANCE:          Activity,
  FIRE_TRUCK:         Flame,
  POLICE:             Shield,
  HAZMAT:             Wind,
  RESCUE_HELICOPTER:  Radio,
  MEDICAL_TEAM:       User,
};

const INCIDENT_TO_UNITS = {
  MEDICAL:          ['AMBULANCE', 'MEDICAL_TEAM'],
  FIRE:             ['FIRE_TRUCK', 'HAZMAT'],
  ACCIDENT:         ['AMBULANCE', 'FIRE_TRUCK', 'RESCUE_HELICOPTER'],
  NATURAL_DISASTER: ['RESCUE_HELICOPTER', 'FIRE_TRUCK', 'HAZMAT'],
  SECURITY:         ['POLICE'],
  OTHER:            ['AMBULANCE', 'FIRE_TRUCK', 'POLICE', 'HAZMAT', 'RESCUE_HELICOPTER', 'MEDICAL_TEAM'],
};

function SeverityBadge({ severity }) {
  const c = SEVERITY_COLOR[severity] || SEVERITY_COLOR.LOW;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.badge }}>
      {severity}
    </span>
  );
}

function UnitIcon({ type }) {
  const Icon = UNIT_ICON_MAP[type] || Truck;
  return <Icon size={16} />;
}

export default function Dispatch() {
  const [incidents, setIncidents]             = useState([]);
  const [search, setSearch]                   = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [loadingRecs, setLoadingRecs]         = useState(false);
  const [dispatching, setDispatching]         = useState(null);
  const [dispatched, setDispatched]           = useState({});

  const fetchOpenIncidents = useCallback(async () => {
    setLoadingIncidents(true);
    try {
      const { data } = await incidentsApi.list({ status: 'OPEN', size: 50, sort: 'createdAt,desc' });
      setIncidents(data.content || []);
    } catch {
      toast.error('Failed to load open incidents');
    } finally {
      setLoadingIncidents(false);
    }
  }, []);

  useEffect(() => {
    fetchOpenIncidents();
  }, [fetchOpenIncidents]);

  const fetchRecommendations = useCallback(async (incident) => {
    if (!incident) return;
    setLoadingRecs(true);
    setRecommendations([]);
    try {
      const { data } = await dispatchApi.getRecommendations(
        incident.id,
        incident.locationLatitude,
        incident.locationLongitude,
        incident.severity,
        incident.emirate
      );
      const allRecs = data.recommendations || [];
      const allowed = INCIDENT_TO_UNITS[incident.type] || INCIDENT_TO_UNITS.OTHER;
      const filtered = allRecs.filter(r => allowed.includes(r.unit?.type));
      setRecommendations(filtered);
      if (filtered.length === 0) {
        toast('No matching units available for this incident type', { icon: '⚠️' });
      }
    } catch {
      toast.error('Could not load recommendations');
    } finally {
      setLoadingRecs(false);
    }
  }, []);

  const handleSelectIncident = (incident) => {
    setSelectedIncident(incident);
    setRecommendations([]);
    setDispatched({});
    fetchRecommendations(incident);
  };

  const handleDispatch = async (rec) => {
    if (!selectedIncident) return;
    setDispatching(rec.unit.id);
    try {
      await dispatchApi.assign({
        incidentId: selectedIncident.id,
        unitId: rec.unit.id,
      });
      setDispatched(prev => ({ ...prev, [rec.unit.id]: true }));
      toast.success(`${rec.unit.unitCode} dispatched successfully`);
      setIncidents(prev => prev.filter(i => i.id !== selectedIncident.id));
      setSelectedIncident(null);
      setRecommendations([]);
      fetchOpenIncidents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Dispatch failed. Please try again.');
    } finally {
      setDispatching(null);
    }
  };

  const filtered = incidents.filter(i =>
    (i.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.emirate || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex" style={{ minHeight: 'calc(100vh - 64px)' }}>

      <div className="w-96 flex-shrink-0 flex flex-col border-r border-gray-100 bg-white">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-3">Open Incidents</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 outline-none focus:border-orange-400 focus:bg-white transition-colors"
              placeholder="Search by title, type, emirate..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingIncidents ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <AlertTriangle size={32} className="text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">No open incidents</p>
            </div>
          ) : (
            filtered.map(incident => (
              <button
                key={incident.id}
                onClick={() => handleSelectIncident(incident)}
                className="w-full text-left px-4 py-3.5 border-b border-gray-50 transition-colors"
                style={{
                  background: selectedIncident?.id === incident.id ? '#fff7ed' : 'transparent',
                  borderLeft: selectedIncident?.id === incident.id
                    ? '3px solid #f97316'
                    : '3px solid transparent',
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">
                    {incident.title}
                  </span>
                  <SeverityBadge severity={incident.severity} />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {incident.emirate}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                    {incident.type}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto">
        {!selectedIncident ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: '#fff7ed' }}>
              <Zap size={28} style={{ color: '#f97316' }} />
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1">Select an incident</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Choose an open incident from the left panel. The system will automatically suggest
              the nearest matching units ready for dispatch.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedIncident.title}</h3>
                  {selectedIncident.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                      {selectedIncident.description}
                    </p>
                  )}
                </div>
                <SeverityBadge severity={selectedIncident.severity} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} style={{ color: '#f97316' }} />
                  {selectedIncident.emirate}
                  {selectedIncident.location && ` — ${selectedIncident.location}`}
                </span>
                <span className="flex items-center gap-1.5">
                  <AlertTriangle size={13} style={{ color: '#f97316' }} />
                  {selectedIncident.type}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                Required unit types:{' '}
                <span className="font-semibold text-gray-600">
                  {(INCIDENT_TO_UNITS[selectedIncident.type] || INCIDENT_TO_UNITS.OTHER)
                    .map(t => t.replace(/_/g, ' '))
                    .join(', ')}
                </span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Zap size={14} style={{ color: '#f97316' }} />
              Nearest Available Units
              {loadingRecs && <Loader2 size={13} className="animate-spin text-gray-400 ml-1" />}
            </h4>

            {loadingRecs && recommendations.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-gray-300" />
              </div>
            )}

            {!loadingRecs && recommendations.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Truck size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">No matching units available</p>
                <p className="text-xs text-gray-400 mt-1">
                  All units for this incident type may be dispatched or offline.
                </p>
              </div>
            )}

            <AnimatePresence>
              <div className="grid gap-3">
                {recommendations.map((rec, idx) => {
                  const isDispatched = dispatched[rec.unit?.id];
                  const isDispatching = dispatching === rec.unit?.id;
                  const busy = dispatching !== null && !isDispatching;
                  return (
                    <motion.div
                      key={rec.unit?.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="rounded-xl border bg-white p-4 shadow-sm flex items-center gap-4"
                      style={{ borderColor: isDispatched ? '#bbf7d0' : '#e5e7eb' }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: isDispatched ? '#f0fdf4' : '#fff7ed' }}>
                        <span style={{ color: isDispatched ? '#16a34a' : '#f97316' }}>
                          <UnitIcon type={rec.unit?.type} />
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-gray-900">{rec.unit?.unitCode}</span>
                          <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-500 font-medium">
                            {(rec.unit?.type || '').replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                            style={{ background: '#fff7ed', color: '#f97316' }}>
                            #{rec.rank}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {rec.distanceKm?.toFixed(1)} km away
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            ETA ~{rec.estimatedArrivalMinutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap size={11} />
                            Score {rec.score?.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDispatch(rec)}
                        disabled={isDispatched || isDispatching || busy}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all flex-shrink-0"
                        style={{
                          background: isDispatched ? '#16a34a' : '#f97316',
                          opacity: busy ? 0.5 : 1,
                          cursor: isDispatched ? 'default' : busy ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isDispatched ? (
                          <><CheckCircle size={14} /> Dispatched</>
                        ) : isDispatching ? (
                          <><Loader2 size={14} className="animate-spin" /> Dispatching</>
                        ) : (
                          <><ChevronRight size={14} /> Dispatch</>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
