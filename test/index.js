import test from "tape"
import composrCli from "../src"

test("composrCli", (t) => {
  t.plan(1)
  t.equal(true, composrCli(), "return true")
})
