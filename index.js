const canvasRed = new Color("#F64453");
const smallWidgetConfig = {
  titleFontSize: 24,
  gradeFontSize: 28,
  scoreFontSize: 24,
  courseFontSize: 22,
  horizontalSpace: 12,
};
const mediumWidgetConfig = {
  titleFontSize: 24,
  gradeFontSize: 28,
  scoreFontSize: 24,
  courseFontSize: 22,
  horizontalSpace: 12,
};
const largeWidgetConfig = {
  titleFontSize: 24,
  gradeFontSize: 28,
  scoreFontSize: 24,
  courseFontSize: 22,
  horizontalSpace: 12,
};
const createWidget = async ({
  titleFontSize,
  gradeFontSize,
  scoreFontSize,
  courseFontSize,
  horizontalSpace,
}) => {
  const widget = new ListWidget();
  // const backgroundColor = new Color("#ec3750");
  // widget.backgroundColor = backgroundColor;
  // widget.addSpacer(null);
  const title = widget.addText("Canvas Grades");
  widget.addSpacer(null);
  title.textColor = canvasRed;
  title.font = Font.boldSystemFont(titleFontSize);
  const courseData = await getData();
  for (const course of courseData) {
    if (!course.current_grade && !course.current_score) continue;
    const stack = widget.addStack();
    widget.addSpacer(null);
    if (course.current_grade) {
      const text = stack.addText(course.current_grade);
      text.font = Font.semiboldSystemFont(gradeFontSize);
      stack.addSpacer(horizontalSpace);
    }
    if (course.current_score) {
      const text = stack.addText("" + course.current_score);
      text.font = Font.regularSystemFont(scoreFontSize);
      stack.addSpacer(null);
    }
    const shortenedName = course.name.split(" - ")[0];
    const text = stack.addText(shortenedName);
    text.font = Font.lightSystemFont(courseFontSize);
    text.textColor = Color.gray();
    stack.bottomAlignContent();
  }
  const footer = widget.addText(
    `Last updated at ${new Date().toLocaleString()}`
  );
  // widget.addSpacer(null);
  footer.font = Font.footnote();
  footer.textColor = Color.lightGray();
  return widget;
};

const BASE_URL = "https://sjusd.instructure.com";
const TOKEN = "your_token_here";

const getData = async () => {
  if (TOKEN === "your_token_here") {
    throw new Error(
      "Please replace `your_token_here` with your own Canvas access token. See https://community.canvaslms.com/t5/Student-Guide/How-do-I-manage-API-access-tokens-as-a-student/ta-p/273 for more information."
    );
  }
  const req = new Request(
    `${BASE_URL}/api/v1/courses?enrollment_state=active&include[]=total_scores`
  );
  req.headers = {
    Authorization: `Bearer ${TOKEN}`,
  };
  const res = await req.loadJSON();
  const filteredData = res.map((course) => ({
    name: course.name,
    current_grade: course.enrollments[0].computed_current_grade,
    current_score: course.enrollments[0].computed_current_score,
  }));
  return filteredData;
};

let sizedConfig = largeWidgetConfig;
if (config.widgetFamily === "small") {
  sizedConfig = smallWidgetConfig;
} else if (config.widgetFamily === "medium") {
  sizedConfig = mediumWidgetConfig;
}

const w = await createWidget(sizedConfig);
if (!config.runsInWidget) {
  await w.presentLarge();
}
Script.setWidget(w);
Script.complete();
