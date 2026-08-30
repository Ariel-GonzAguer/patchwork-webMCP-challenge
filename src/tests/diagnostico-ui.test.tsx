import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Diagnostico from '../paginas/diagnostico';

vi.mock('@arielgonzaguer/michi-router', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('página Diagnóstico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el selector de cultivo con todos los cultivos', () => {
    render(<Diagnostico />);
    const selector = screen.getByLabelText('Affected crop');
    expect(selector).toBeInTheDocument();
    expect(
      (selector as HTMLSelectElement).options.length,
    ).toBeGreaterThanOrEqual(24);
  });

  it('muestra el mensaje inicial pidiendo síntomas', () => {
    render(<Diagnostico />);
    expect(screen.getByText(/Select at least one symptom/)).toBeInTheDocument();
  });

  it('los chips de síntomas tienen aria-pressed', () => {
    render(<Diagnostico />);
    const chip = screen.getByRole('button', { name: 'Yellowing leaves' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
  });

  it('diagnostica mildiu temprano al seleccionar síntomas de tomate', async () => {
    const usuario = userEvent.setup();
    render(<Diagnostico />);

    await usuario.click(
      screen.getByRole('button', { name: 'Yellowing leaves' }),
    );
    await usuario.click(screen.getByRole('button', { name: 'Brown spots' }));

    expect(screen.getByText('Early Blight')).toBeInTheDocument();
    expect(screen.getByLabelText('Diagnosis results')).toHaveTextContent(
      'Remove affected leaves',
    );
  });

  it('alterna el estado del chip al hacer click dos veces', async () => {
    const usuario = userEvent.setup();
    render(<Diagnostico />);

    const chip = screen.getByRole('button', { name: 'White powder' });
    await usuario.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');

    await usuario.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'false');
  });

  it('muestra la severidad y el porcentaje de coincidencia', async () => {
    const usuario = userEvent.setup();
    render(<Diagnostico />);

    await usuario.click(screen.getByRole('button', { name: 'Brown spots' }));
    await usuario.click(screen.getByRole('button', { name: 'Wilting' }));

    expect(screen.getAllByText(/severity/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\d+% match/).length).toBeGreaterThan(0);
  });

  it('muestra el panel "Ask your agent" con prompts', () => {
    render(<Diagnostico />);
    expect(screen.getByLabelText('Ask your agent')).toHaveTextContent(
      'Diagnose it',
    );
  });
});
