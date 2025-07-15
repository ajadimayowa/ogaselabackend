"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalGovernments = exports.getStates = void 0;
const states_1 = require("../constants/states");
// Get all states
const getStates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.status(200).json({ success: true, payload: states_1.statesData });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching states', error: error });
    }
});
exports.getStates = getStates;
// Get local governments by state ID
const getLocalGovernments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { stateId } = req.params;
    try {
        const state = states_1.statesData.find((s) => s.id === +stateId);
        if (!state) {
            return res.status(404).json({ message: 'State not found' });
        }
        return res.status(200).json({ success: true, payload: state.localGovernmentAreas });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error });
    }
});
exports.getLocalGovernments = getLocalGovernments;
