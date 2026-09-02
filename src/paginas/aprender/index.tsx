import Marco from '../../componentes/marco';
import { webmcpDisponible } from '../../webmcp/registrarTools';
import './aprender.css';

interface ToolDoc {
  nombre: string;
  tipo: 'read' | 'write';
  queHace: string;
  ejemplo: string;
}

const TOOLS: readonly ToolDoc[] = [
  {
    nombre: 'list_crops',
    tipo: 'read',
    queHace:
      'Searches the crop catalog by keyword, sun hours, season or spacing.',
    ejemplo: '"What crops fit a partial-sun garden in fall?"',
  },
  {
    nombre: 'get_garden_state',
    tipo: 'read',
    queHace: 'Reads the current beds, placements and pending tasks.',
    ejemplo: '"Show me the current state of my garden."',
  },
  {
    nombre: 'design_bed',
    tipo: 'write',
    queHace:
      'Adds or removes crops on a bed, validating sun, spacing and companion rules. Returns warnings the agent can react to.',
    ejemplo: '"Plant tomatoes, basil and carrots in bed 1, spaced out."',
  },
  {
    nombre: 'suggest_plan',
    tipo: 'read',
    queHace: 'Suggests a seasonal planting plan with reasons for each crop.',
    ejemplo: '"Plan my spring garden, I only get 4 hours of sun."',
  },
  {
    nombre: 'log_task',
    tipo: 'write',
    queHace: 'Adds care tasks (water, harvest, prune…) to the shared calendar.',
    ejemplo: '"Remind me to water the lettuce every 3 days."',
  },
  {
    nombre: 'diagnose_issue',
    tipo: 'read',
    queHace: 'Matches symptoms to likely problems and returns care actions.',
    ejemplo: '"My tomato leaves are yellow with brown spots — what is it?"',
  },
];

export default function Aprender() {
  const activo = webmcpDisponible();

  return (
    <Marco>
      <h1>Learn — what the agent sees</h1>
      <p>
        PatchWork registers <strong>6 structured tools</strong> with the browser
        via the{' '}
        <a
          href="https://webmachinelearning.github.io/webmcp/"
          target="_blank"
          rel="noreferrer"
        >
          WebMCP
        </a>{' '}
        standard. When you open this app inside ChatGPT&apos;s in-app browser
        (or Chrome 149+ with the <code>enable-webmcp-testing</code> flag), the
        agent can call these tools instead of clicking through the UI — and
        every change shows up live on the shared canvas.
      </p>

      <p className={`estado-webmcp ${activo ? 'activo' : ''}`} role="status">
        {activo
          ? 'WebMCP is active in this browser — the agent can see these tools.'
          : 'WebMCP not detected in this browser. Open this app in ChatGPT (in-app browser) or Chrome with the WebMCP flag to let the agent in.'}
      </p>

      <div>
        <h2>How to use</h2>

        <p>There are two ways to use PatchWork:</p>
        <ol>
          <li>
            <strong>ChatGPT desktop app</strong> (GPT-5.6 Sol/Terra): open the
            live URL in the in-app browser. The tools register automatically.
            Try:{' '}
            <em>
              "Plant tomatoes, basil and carrots in bed 1, spaced out nicely."
            </em>
          </li>
          <li>
            <strong>Chrome 149+</strong>: enable{' '}
            <code>chrome://flags/#enable-webmcp-testing</code>, install the
            oficial{' '}
            <a
              href="https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd"
              target="_blank"
              rel="noreferrer"
            >
              WebMCP extension
            </a>
            , go to the PatchWork URL, open the extension, put a compatible API
            key, and start interacting with the model.
          </li>
        </ol>
      </div>

      <h2>The 6 tools</h2>
      <div className="rejilla-tools">
        {TOOLS.map((tool) => (
          <article key={tool.nombre} className="tool tarjeta">
            <h3>
              <code>{tool.nombre}</code>{' '}
              <span className={`badge-tipo ${tool.tipo}`}>
                {tool.tipo === 'read' ? 'read-only' : 'write'}
              </span>
            </h3>
            <p>{tool.queHace}</p>
            <p className="ejemplo-tool">
              <strong>Try in ChatGPT:</strong> {tool.ejemplo}
            </p>
          </article>
        ))}
      </div>

      <h2>Why this matters</h2>
      <ul>
        <li>
          <strong>Same state, two actors.</strong> You click a cell, the agent
          calls <code>design_bed</code> — both land in the same shared store,
          instantly visible to each other.
        </li>
        <li>
          <strong>Negotiation, not guessing.</strong> The rules engine returns
          real horticultural conflicts (antagonists, spacing, sun). The agent
          can adjust and retry until the plan works.
        </li>
        <li>
          <strong>Trust through visibility.</strong> Every agent action is
          logged in the activity panel, so you always see what it did and why.
        </li>
      </ul>
    </Marco>
  );
}
