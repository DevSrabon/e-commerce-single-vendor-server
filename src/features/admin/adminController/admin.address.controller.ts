import { Request, Response } from "express";
import AdminAbstractController from "../adminAbstracts/admin.abstract.controller";
import AdminAreaService from "../adminService/admin.address.service";

class AdminAddressController extends AdminAbstractController {
  private areaService = new AdminAreaService();
  constructor() {
    super();
  }

  // get all Countries
  public getAllCountries = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.areaService.getAllCountries(req);
      res.json(data);
    }
  );

  public createCountry = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.areaService.createCountry(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(409).json(data);
      }
    }
  );

  public updateCountry = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.areaService.updateCountry(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(409).json(data);
      }
    }
  );

  // delete country
  public deleteCountry = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.areaService.deleteCountry(req);
      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(409).json(data);
      }
    }
  );

  // get all province
  public getAllProvince = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.areaService.getAllProvince(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get all city by province or all
  public getAllCityByProvinceOrAll = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.areaService.getAllCitiesByProvince(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get all sub city by city
  public getAllSubCityByCity = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.areaService.getAllSubCityByCity(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // create sub city
  public createSubCity = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.areaService.createSubCity(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // get all area by sub city
  public getAllAreaBySubCity = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.areaService.getAllAreaBySubCity(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );

  // create area
  public createArea = this.asyncWrapper.wrap(
    async (req: Request, res: Response) => {
      const data = await this.areaService.createArea(req);

      if (data.success) {
        res.status(201).json(data);
      } else {
        res.status(404).json(data);
      }
    }
  );
}

export default AdminAddressController;
