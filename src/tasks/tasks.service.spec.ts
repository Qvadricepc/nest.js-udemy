import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './dto/create-task.dto.';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
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

describe('TasksService', () => {
  let service: TasksService;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TasksRepository,
          useFactory: mockTasksRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<TasksRepository>(TasksRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTasks', () => {
    it('should get all tasks from the repository', async () => {
      const filterDto: GetTasksFilterDto = { status: TaskStatus.OPEN, search: 'test' };
      repository.getTasks.mockResolvedValue([mockTask]);

      const result = await service.getTasks(filterDto, mockUser);

      expect(repository.getTasks).toHaveBeenCalledWith(filterDto, mockUser);
      expect(result).toEqual([mockTask]);
    });
  });

  describe('getTaskById', () => {
    it('should retrieve and return task by id', async () => {
      repository.findOne.mockResolvedValue(mockTask);

      const result = await service.getTaskById('1', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', user: { id: mockUser.id } },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getTaskById('1', mockUser)).rejects.toThrow(
        new NotFoundException('Task with ID "1" not found'),
      );
    });
  });

  describe('createTask', () => {
    it('should create and return a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
      };
      repository.createTask.mockResolvedValue(mockTask);

      const result = await service.createTask(createTaskDto, mockUser);

      expect(repository.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      repository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteTask('1', mockUser);

      expect(repository.delete).toHaveBeenCalledWith({
        id: '1',
        user: { id: mockUser.id },
      });
    });

    it('should throw NotFoundException when task to delete is not found', async () => {
      repository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteTask('1', mockUser)).rejects.toThrow(
        new NotFoundException('Task with ID "1" not found'),
      );
    });
  });

  describe('patchTaskStatus', () => {
    it('should update task status and return updated task', async () => {
      const updatedTask = { ...mockTask, status: TaskStatus.IN_PROGRESS };
      repository.findOne.mockResolvedValue(mockTask);
      repository.save.mockResolvedValue(updatedTask);

      const result = await service.patchTaskStatus('1', TaskStatus.IN_PROGRESS, mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', user: { id: mockUser.id } },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockTask,
        status: TaskStatus.IN_PROGRESS,
      });
      expect(result.status).toEqual(TaskStatus.IN_PROGRESS);
    });

    it('should throw NotFoundException when task to update is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.patchTaskStatus('1', TaskStatus.IN_PROGRESS, mockUser),
      ).rejects.toThrow(new NotFoundException('Task with ID "1" not found'));
    });
  });
});
