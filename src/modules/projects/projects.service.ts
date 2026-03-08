import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { getPool } from '../../db/pg';
import { CreateProjectDto } from './dto';

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class ProjectsService {
  async list(): Promise<Project[]> {
    const { rows } = await getPool().query(
      `select id, name, description, status, created_at as "createdAt", updated_at as "updatedAt"
       from projects order by created_at desc`,
    );
    return rows;
  }

  async listCompleted(): Promise<Project[]> {
    const { rows } = await getPool().query(
      `select id, name, description, status, created_at as "createdAt", updated_at as "updatedAt"
       from projects where status='completed' order by created_at desc`,
    );
    return rows;
  }

  async get(id: string): Promise<Project> {
    const { rows } = await getPool().query(
      `select id, name, description, status, created_at as "createdAt", updated_at as "updatedAt"
       from projects where id=$1`,
      [id],
    );
    const p = rows[0];
    if (!p) throw new NotFoundException('Project not found');
    return p;
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    const id = randomUUID();
    const now = new Date().toISOString();
    await getPool().query(
      `insert into projects (id, name, description, status, created_at, updated_at)
       values ($1,$2,$3,'active',$4,$4)`,
      [id, dto.name, dto.description ?? null, now],
    );

    // initialize workflow step states (draft)
    await getPool().query(
      `insert into workflow_step_state (project_id, step_id, state, updated_at)
       select $1, step_id, 'draft', $2 from workflow_steps`,
      [id, now],
    );

    return this.get(id);
  }
}
