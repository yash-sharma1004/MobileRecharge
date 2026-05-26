import * as providerService from './provider.service.js';

export const getProviders = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: providerService.getProviderStatus()
    });
  } catch (error) {
    next(error);
  }
};
