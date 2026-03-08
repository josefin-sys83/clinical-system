import { JwtAuthGuard, Roles, RolesGuard } from '../auth';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateProjectDto } from './dto';
import { ProjectsService } from './projects.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('projects')
@Controller('/api/projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list() {
    return this.projects.list();
  }

  @Get('/completed')
  listCompleted() {
    return this.projects.listCompleted();
  }

  @Get('/:projectId')
  get(@Param('projectId') projectId: string) {
    return this.projects.get(projectId);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }
}
