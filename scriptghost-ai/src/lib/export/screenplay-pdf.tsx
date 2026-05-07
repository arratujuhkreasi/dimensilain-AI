import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { Screenplay, SceneElement } from "@/lib/types/screenplay";

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingRight: 54,
    paddingBottom: 54,
    paddingLeft: 72,
    fontFamily: "Courier",
    fontSize: 11,
    lineHeight: 1.35,
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  titlePage: {
    padding: 72,
    fontFamily: "Courier",
    fontSize: 12,
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  titleWrap: {
    marginTop: 160,
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    textTransform: "uppercase",
    marginBottom: 24,
  },
  credit: {
    marginBottom: 8,
  },
  meta: {
    marginTop: 48,
    fontSize: 10,
    color: "#555555",
  },
  act: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 12,
    marginBottom: 18,
    textTransform: "uppercase",
  },
  sceneHeading: {
    marginTop: 12,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  action: {
    marginBottom: 8,
  },
  character: {
    marginTop: 10,
    marginLeft: 190,
    textTransform: "uppercase",
  },
  parenthetical: {
    marginLeft: 150,
    marginBottom: 2,
  },
  dialogue: {
    marginLeft: 110,
    marginRight: 110,
    marginBottom: 8,
  },
  transition: {
    textAlign: "right",
    marginTop: 10,
    marginBottom: 8,
    textTransform: "uppercase",
  },
});

export async function createScreenplayPdfBuffer(screenplay: Screenplay) {
  return renderToBuffer(<ScreenplayPdf screenplay={screenplay} />);
}

function ScreenplayPdf({ screenplay }: { screenplay: Screenplay }) {
  return (
    <Document
      title={screenplay.projectConfig.title}
      author="ScriptGhost AI"
      subject={`Horror screenplay - ${screenplay.projectConfig.subGenre}`}
      creator="ScriptGhost AI"
      language="id"
    >
      <Page size="A4" style={styles.titlePage}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{screenplay.projectConfig.title}</Text>
          <Text style={styles.credit}>Written by</Text>
          <Text>ScriptGhost AI</Text>
          <Text style={styles.meta}>
            {screenplay.projectConfig.subGenre} / {screenplay.projectConfig.duration} menit
          </Text>
        </View>
      </Page>
      <Page size="A4" style={styles.page} wrap>
        {screenplay.acts.map((act) => (
          <View key={act.actNumber}>
            <Text style={styles.act}>
              ACT {act.actNumber}: {act.title}
            </Text>
            {act.scenes.map((scene) => (
              <View key={scene.id}>
                {scene.elements.map((element, index) => (
                  <PdfElement key={`${scene.id}-${index}`} element={element} />
                ))}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

function PdfElement({ element }: { element: SceneElement }) {
  switch (element.type) {
    case "scene-heading":
      return <Text style={styles.sceneHeading}>{element.content}</Text>;
    case "action":
      return <Text style={styles.action}>{element.content}</Text>;
    case "character-name":
      return <Text style={styles.character}>{element.content}</Text>;
    case "parenthetical":
      return <Text style={styles.parenthetical}>({element.content})</Text>;
    case "dialogue":
      return <Text style={styles.dialogue}>{element.content}</Text>;
    case "transition":
      return <Text style={styles.transition}>{element.content}</Text>;
  }
}
