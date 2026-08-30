import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useJardinStore } from '../store/jardin';
import Jardin from '../paginas/jardin';

vi.mock('@arielgonzaguer/michi-router', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

function renderizar() {
  return render(<Jardin />);
}

describe('página Jardin', () => {
  beforeEach(() => {
    useJardinStore.getState().reiniciarJardin();
  });

  it('renderiza las dos camas con celdas', () => {
    renderizar();
    expect(screen.getByLabelText('Bed 1 grid')).toBeInTheDocument();
    expect(screen.getByLabelText('Bed 2 grid')).toBeInTheDocument();
    const celdas = screen.getAllByRole('gridcell');
    expect(celdas).toHaveLength(48); // 2 camas x 4x6
  });

  it('las celdas vacías tienen aria-label accesible', () => {
    renderizar();
    expect(screen.getAllByRole('gridcell')[0]).toHaveAccessibleName(
      /Empty cell at column 1, row 1/,
    );
  });

  it('plantar con click agrega el cultivo y lo muestra con emoji', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.selectOptions(screen.getByLabelText('Plant:'), 'carrot');
    await usuario.click(screen.getAllByRole('gridcell')[0]!);

    expect(screen.getAllByRole('gridcell')[0]).toHaveTextContent('🥕');
  });

  it('al plantar un antagonista se muestra el aviso', async () => {
    const usuario = userEvent.setup();
    useJardinStore
      .getState()
      .colocar(0, { crop_id: 'tomato', x: 0, y: 0 }, 'human', null, 0, '');

    renderizar();

    await usuario.selectOptions(screen.getByLabelText('Plant:'), 'potato');
    await usuario.click(screen.getAllByRole('gridcell')[1]!);

    expect(screen.getByRole('alert')).toHaveTextContent(/poor companions/i);
  });

  it('click sobre celda ocupada la remueve', async () => {
    const usuario = userEvent.setup();
    useJardinStore
      .getState()
      .colocar(0, { crop_id: 'tomato', x: 0, y: 0 }, 'human', null, 0, '');

    renderizar();
    await usuario.click(screen.getAllByRole('gridcell')[0]!);

    expect(screen.getAllByRole('gridcell')[0]).toHaveTextContent('');
  });

  it('el detalle del cultivo muestra información del seleccionado', () => {
    renderizar();
    expect(screen.getByLabelText('Details for Tomato')).toHaveTextContent(
      'Full sun',
    );
  });

  it('el registro de actividad muestra entradas del agente', () => {
    useJardinStore
      .getState()
      .colocar(
        0,
        { crop_id: 'basil', x: 2, y: 2 },
        'agent',
        'design_bed',
        1,
        'Placed basil',
      );

    renderizar();
    expect(screen.getByLabelText('Garden activity log')).toHaveTextContent(
      'design_bed',
    );
    expect(screen.getByLabelText('Garden activity log')).toHaveTextContent(
      '1 warnings',
    );
  });
});
