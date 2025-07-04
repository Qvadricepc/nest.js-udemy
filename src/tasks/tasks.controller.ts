import {Controller, Get} from '@nestjs/common';
import {TasksService} from "./tasks.service";

@Controller('tasks')
export class TasksController {
    constructor(readonly tasksService: TasksService) {}
    @Get()
    getTasks() {
        return this.tasksService.getAllTasks();
    }
}
