import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Paragraph } from "./Paragraph";

describe("Paragraph", () => {
  test("переданный className попадает в DOM", () => {
    render(<Paragraph className="my-class">текст</Paragraph>);
    expect(screen.getByText("текст")).toHaveProperty(
      "className",
      expect.stringContaining("my-class"),
    );
  });

  test("без className в DOM нет класса 'undefined'", () => {
    render(<Paragraph>текст</Paragraph>);
    expect(screen.getByText("текст").className).not.toContain("undefined");
  });

  test("variant ставит свой класс", () => {
    render(<Paragraph variant="large">текст</Paragraph>);
    expect(screen.getByText("текст").classList).toContain("text-large");
  });
});
