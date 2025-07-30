import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto.';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDTO } from './dto/update-task-status.dto';

const mockTasksService = () => ({
  getTasks: jest.fn(),
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  patchTaskStatus: jest.fn(),
});

const mockUser: User = {
  id: '1',
  username: 'testuser',
  password: 'hashedpassword',
  tasks: [],
};

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.OPEN,
  user: mockUser,
};

describe('TasksController', () => {
  let controller: TasksController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useFactory: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTasks', () => {
    it('should get all tasks', async () => {
      const filterDto: GetTasksFilterDto = { status: TaskStatus.OPEN, search: 'test' };
      service.getTasks.mockResolvedValue([mockTask]);

      const result = await controller.getTasks(filterDto, mockUser);

      expect(service.getTasks).toHaveBeenCalledWith(filterDto, mockUser);
      expect(result).toEqual([mockTask]);
    });
  });

  describe('getTaskById', () => {
    it('should get a task by id', async () => {
      service.getTaskById.mockResolvedValue(mockTask);

      const result = await controller.getTaskById('1', mockUser);

      expect(service.getTaskById).toHaveBeenCalledWith('1', mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
      };
      service.createTask.mockResolvedValue(mockTask);

      const result = await controller.createTask(createTaskDto, mockUser);

      expect(service.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      service.deleteTask.mockResolvedValue(undefined);

      const result = await controller.deleteTask('1', mockUser);

      expect(service.deleteTask).toHaveBeenCalledWith('1', mockUser);
      expect(result).toBeUndefined();
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const updateTaskStatusDto: UpdateTaskStatusDTO = {
        status: TaskStatus.IN_PROGRESS,
      };
      const updatedTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };
      service.patchTaskStatus.mockResolvedValue(updatedTask);

      const result = await controller.updateTaskStatus('1', updateTaskStatusDto, mockUser);

      expect(service.patchTaskStatus).toHaveBeenCalledWith(
        '1',
        TaskStatus.IN_PROGRESS,
        mockUser,
      );
      expect(result).toEqual(updatedTask);
    });
  });
});
