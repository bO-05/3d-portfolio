/**
 * Context Recovery Handler - Wraps useContextRecovery hook for Canvas
 * Must be rendered inside Canvas to access WebGL context via useThree
 * @module components/Scene/ContextRecoveryHandler
 */

import { useContextRecovery } from '../../hooks/useContextRecovery';

/**
 * Component that handles WebGL context loss/recovery
 * Renders nothing - just sets up event listeners
 */
export function ContextRecoveryHandler() {
    useContextRecovery();
    return null;
}
