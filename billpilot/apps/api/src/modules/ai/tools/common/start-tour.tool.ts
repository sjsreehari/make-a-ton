import { Injectable, BadRequestException } from '@nestjs/common';
import { ITool, ToolResult } from '../tool.interface';
import { TOURS } from '@billpilot/shared';

@Injectable()
export class StartTourTool implements ITool {
  readonly name = 'start_tour';
  readonly description = 'Starts an interactive step-by-step guided walkthrough across the BillPilot application';
  readonly roles = ['CUSTOMER', 'STAFF', 'ADMIN'];

  async execute(input: { tourId: string }, ctx: { userId: string; role: string }): Promise<ToolResult> {
    const tour = TOURS[input.tourId];
    if (!tour) {
      throw new BadRequestException(`Tour '${input.tourId}' does not exist.`);
    }

    const asOf = new Date().toISOString();
    return {
      data: {
        action: 'tour',
        tourId: tour.id,
        title: tour.title,
        steps: tour.steps,
      },
      basis: { asOf, rowCount: tour.steps.length },
      assumptions: ['Static authored guided tour steps'],
    };
  }
}
