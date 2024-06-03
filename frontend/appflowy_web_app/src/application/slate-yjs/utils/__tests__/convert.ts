import { withTestingYDoc, withTestingYjsEditor } from './withTestingYjsEditor';
import { yDocToSlateContent } from '../convert';
import { createEditor, Editor } from 'slate';
import { expect } from '@jest/globals';
import * as Y from 'yjs';

function normalizedSlateDoc(doc: Y.Doc) {
  const editor = createEditor();

  const yjsEditor = withTestingYjsEditor(editor, doc);

  editor.children = yDocToSlateContent(doc)?.children ?? [];
  return yjsEditor.children;
}

export async function runCollaborationTest() {
  const doc = withTestingYDoc('1');
  const editor = createEditor();
  const yjsEditor = withTestingYjsEditor(editor, doc);

  // Keep the 'local' editor state before applying run.
  const baseState = Y.encodeStateAsUpdateV2(doc);

  Editor.normalize(editor, { force: true });

  expect(normalizedSlateDoc(doc)).toEqual(yjsEditor.children);

  // Setup remote editor with input base state
  const remoteDoc = new Y.Doc();

  Y.applyUpdateV2(remoteDoc, baseState);
  const remote = withTestingYjsEditor(createEditor(), remoteDoc);

  // Apply changes from 'run'
  Y.applyUpdateV2(remoteDoc, Y.encodeStateAsUpdateV2(yjsEditor.sharedRoot.doc!));

  // Verify remote and editor state are equal
  expect(normalizedSlateDoc(remoteDoc)).toEqual(remote.children);
  expect(yjsEditor.children).toEqual(remote.children);
  expect(normalizedSlateDoc(doc)).toEqual(yjsEditor.children);
}
