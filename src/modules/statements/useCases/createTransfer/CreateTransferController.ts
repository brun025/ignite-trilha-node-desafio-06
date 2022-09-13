import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

export class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { user_id: recipient_id } = request.params;
    const {id: sender_id} = request.user;
    const { amount, description } = request.body;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    const transfer = await createTransferUseCase.execute({
      sender_id,
      recipient_id,
      amount,
      description,
    });

    return response.status(201).json(transfer);
  }
}
