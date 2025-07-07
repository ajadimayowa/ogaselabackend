// controllers/stateController.ts
import { Request, Response } from 'express';
import { statesData } from '../constants/states';

// Get all states
export const getStates = async (req: Request, res: Response): Promise<any> => {
    try {
        return res.status(200).json(statesData);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching states', error });
    }
};

// Get local governments by state ID
export const getLocalGovernments = async (req: Request, res: Response): Promise<any> => {
    const { stateId } = req.params;

    try {
        const state = statesData.find((s) => s.id === +stateId);
        if (!state) {
            return res.status(404).json({ message: 'State not found' });
        }

        return res.status(200).json(state.localGovernmentAreas);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching local governments', error });
    }
};
