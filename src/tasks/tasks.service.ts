import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksService {
    readonly tasks = [];
    getAllTasks() {
        return this.tasks;
    }
}
